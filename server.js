import express from "express";
import session from "express-session";
import pg from "pg";
import env from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import mdbg from "mdbg";
import bcrypt from "bcrypt";
import passport from "passport";
import flash from "connect-flash";
import { configurePassport } from "./config/passport.js";

//directory path
const __dirname = dirname(fileURLToPath(import.meta.url));

//dotenv setup
env.config();

//bcrypt salt rounds
const saltRounds = 10;

//Express setup
const app = express();
const port = process.env.PORT;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());
const { Pool } = pg;

//Postgres setup
const db = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

configurePassport(db);

app.get("/", async (req, res) => {
  if (req.user) {
    res.render("index.ejs", { user: req.user });
  } else {
    res.render("index.ejs");
  }
});

app.get("/login", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login.ejs", {message: req.flash("error")});
  }
});

app.get("/register", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register.ejs");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("select * from users where email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      console.log("Email already exits");
      res.render("login.ejs", {
        data: "This email already exists, please login",
      });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(`Error hashing password: ${err}`);
        } else {
          const result = await db.query(
            "insert into users (email, password, username) values ($1, $2, $3) returning *",
            [email, hash, username]
          );
        }
      });
    }
    res.redirect("/login");
  } catch (error) {
    console.log(`Error while registering: ${error}`);
  }
});

app.get("/leaderboard", async (req, res) => {
  const scores = await getAllScores();
  res.render("leaderboard.ejs", {scores: scores, user: req.user});
});

async function getAllScores() {
  try {
    const results = await db.query(
      "select username, highscore from users where highscore is not null order by highscore desc limit 10"
    );
    return results.rows;
  } catch (error) {
    console.log(`Error when getting all scores (back end): ${error}`);
  }
}

//Check authentication and return status
app.get("/auth/status", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
  });
});

app.get("/userData", (req, res) => {
  console.log(`Returning user data: ${req.user}`);

  res.json({
    user: req.user,
  });
});

//Gets a batch of random questions of selected hsk level.
app.post("/getSentences", async (req, res) => {
  console.log(req.body);
  const likeClause = generateLikeClause(req.body.levels);
  const amount = req.body.amount;

  try {
    const results = await db.query(
      `SELECT sentence_text, sentence_translation, sentences.pinyin_sentence, character, measure_words.pinyin_character, definition FROM sentences 
        JOIN measure_words on measure_word_id = measure_words.id
        WHERE${likeClause}
        ORDER BY RANDOM()
        LIMIT ${amount}`
    );

    const formattedData = [];
    for (let row of results.rows) {
      const formattedSentence = row.sentence_text.replace(
        row.character.trim(),
        " ＿ "
      );
      formattedData.push({
        sentence: formattedSentence,
        translation: row.sentence_translation,
        pinyinSentence: row.pinyin_sentence,
        answer: row.character.trim(),
        answerPinyin: row.pinyin_character,
        answerDefinition: row.definition,
        translOrder: await translateOrder(formattedSentence),
      });
    }

    res.json({ message: formattedData });
  } catch (err) {
    console.log(`An error occured: ${err}`);
    return err;
  }
});

app.post("/updateHighScore", async (req, res) => {
  console.log(req.body);
  try {
    await db.query(
      `UPDATE users SET highscore = ${req.body.score} WHERE id = ${req.user.id}`
    );
  } catch (error) {
    console.log(`An error occured when updating the hi score: ${error}`);
  }
});

app.post("/getMeasureWords", async (req, res) => {
  const likeClause = generateLikeClause(req.body);
  try {
    const results = await db.query(
      `SELECT * FROM measure_words where${likeClause}`
    );
    const formattedData = results.rows.map((i) => {
      return i.character.trim();
    });
    res.json({ message: formattedData });
  } catch (err) {
    console.log(`An error occurred: ${err}`);
    return err;
  }
});

function generateLikeClause(levels) {
  let likeClause = "";
  levels.forEach((level, index) => {
    if (level === "7") {
      if (index === levels.length - 1) {
        likeClause = likeClause + ` hsk_level LIKE '7-9%' `;
      } else {
        likeClause = likeClause + ` hsk_level LIKE '7-9%' OR`;
      }
    } else {
      if (index === levels.length - 1) {
        likeClause = likeClause + ` hsk_level LIKE '${level}%' `;
      } else {
        likeClause = likeClause + ` hsk_level LIKE '${level}%' OR`;
      }
    }
  });
  return likeClause;
}

//Takes each sentence and translates each word. Returns the translated sentence 
async function translateOrder(str) {
  let words = str.split(" "); //Split the sentence

  words.forEach((word, index) => { //If there is an empty string, remove it.
    if (word === "") {
      words.splice(index, 1);
    }
  });

  let translateOrder = [];
  for (const word of words) { //Translates each word in the sentence using mdbg and returns the translated sentence in the correct order.
    if (word !== "＿") {
      const transl = await mdbg.getByHanzi(word);
      const definitions = transl.definitions;

      let mapped = Object.entries(definitions).map(
        ([k, v]) => definitions[k].translations
      );

      if (mapped[0].length > 1) {
        translateOrder.push(mapped[0].slice(0, 2).join(";"));
      } else {
        translateOrder.push(mapped[0][0]);
      }
    } else {
      translateOrder.push("＿");
    }
  }

  return translateOrder;
}

//express listen
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
