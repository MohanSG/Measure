# Measure
<div>
  <img height="150" alt="logo" src="https://github.com/user-attachments/assets/d41bb4e8-6abe-4ada-a9b1-ac768e8ba160" />
</div>
<a href="https://github.com/MohanSG/Measure">Github</a>
<br>

## Technologies Used
<div>
  <ul>
    <li>HTML/CSS/JS</li>
    <li>Node/Expressjs/EJS</li>
    <li>Postgres</li>
  </ul>
</div>

## What is measure?
<div style="margin-bottom: 10">
Measure is website for practicing chinese measure words. Chinese measure words are essential classifiers used between a number/denominator and a noun. Measure allows users to practice at their
own HSK level as well as compete with others using the speed mode. Users are able to register and login to an account and try to place on the top 10 leaderboards. Measure in its current form is a
very simple tool mainly used for practice rather than learning. Measure is fully responsive and comfortable to use on both desktops and mobile. 
</div>

<div>
  <img height="300" alt="Homepage" src="https://github.com/user-attachments/assets/d2b5b2c6-aa75-4de3-b7b0-fa29e90ee7f1" />
  <img height="350" alt="image" src="https://github.com/user-attachments/assets/3439e309-3d13-4391-8b94-362cdf7dbed7" />
</div>

## Practice Mode
<div>
  Practice mode allows users to answer gap-fill questions after choosing their desired HSK level. In this mode, users go at their own pace to answer 20 questions. At the end, their score is given
  and they are given the option to try again. If help is needed, a translate button is available which shows the pinyin and english for any hovered word. This button can be toggled on/off at any time
  during the quiz.
  </div>
  <br>
  <div>
After a user selects their hsk level, a set of 20 random questions are queried from the database. This is always done once before the practice session to minimize the amount of database calls made to the database. 
    
```javascript
  try {
    const results = await db.query(
      `SELECT sentence_text, sentence_translation, sentences.pinyin_sentence, character, measure_words.pinyin_character, definition FROM sentences 
        JOIN measure_words on measure_word_id = measure_words.id
        WHERE${likeClause} //likeClause is a generated depending on the hsk levels chosen by the user
        ORDER BY RANDOM()
        LIMIT ${amount}` //amount is the number of questions to retreive, in this case it would be 20
    );
```
  </div>

<div>
  <img height="200" alt="Practice-Mode" src="https://github.com/user-attachments/assets/ed8580d7-ed24-4828-b4a1-8de234fe3606" />
  <img height="200" alt="Practice-Recording" src="https://github.com/user-attachments/assets/54460a06-e7f2-4fa8-ab63-117c9d288cfd"/>
</div>

## Speed Mode
<div>
  Speed mode is similar to practice mode except for a few changes. First, a 30 second time constraint is now placed on the user, the time taken for the next question to be displayed is decreased and the user now needs to be logged in. The aim is to answer as many questions as possible before the 30 seconds is up. After the speed mode session is complete, if the user doesn't have a previous hiscore or they have beaten their previous score, their hiscore will be updated in the database. The leaderboards will then be checked to see if they are eligible to be placed in the top 10. Speed mode also requires users to answer questions for all hsk levels as there is currently only one leaderboard. In the future, I would like to add a leaderboard for each HSK level. 
</div>
<br>
  <div>
With speed mode, the user need to answer as many questions as possible. For this reason, the server needs to retrieve even more questions. 
    
```javascript
  try {
    const results = await db.query(
      `SELECT sentence_text, sentence_translation, sentences.pinyin_sentence, character, measure_words.pinyin_character, definition FROM sentences 
        JOIN measure_words on measure_word_id = measure_words.id
        WHERE${likeClause}
        ORDER BY RANDOM()
        LIMIT ${amount}` //In this case, amount would be 200
    );
```
  </div>
  
<div>
  <img height="350" alt="image" src="https://github.com/user-attachments/assets/b0f57b59-1805-4cb3-9161-e5460182b696" />
</div>

## Leaderboard
<div>
  The leaderboard shows the current top 10 scorers. As I mentioned earlier, speed mode requires users to answer questions for all hsk levels. This is the most fair way to place users as there is only one leaderboard. In the future, I would like to add a leaderboard for each HSK level.
</div>

<br>

<div> I used EJS to simplify the leaderboard layout. The top 10 scorers are queried from the database when the page is loaded.</div>

<div>
  <img height="350" alt="Screenshot 2026-03-04 151410" src="https://github.com/user-attachments/assets/f54fecdd-fee9-46ce-bcd5-b57f80c6f783" />
</div>

## Register/Login
<div>
  Users have the ability to use the practice mode without authentication. For speed mode, authentication is needed to for leaderboards and saving scores. I used a local passport session strategy to achieve this. In the future, I would like to add Oauth authentication too. 
</div>
<br>
<div>
  Validation is important for database integrity. Here are the methods I used to ensure all emails and passwords follow a specific format

  ```javascript
//Validation for passwords, one uppercase and lowercase letter, one digit, one special character and should be more than 8 characters
//This function checks to ensure the password follows a specific format
function validatePassword(pw) { 
  return (
    /[A-Z]/.test(pw) && 
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw) &&
    pw.length > 8
  );
}

//Checks email format is a valid email
function validateEmail(email) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailValidated = true;
    document.querySelector(".vl-email").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    emailValidated = false;
    document.querySelector(".vl-email").style.color = "red";
  }
}

//Checks each password requirement individually, if the requirement is satisfied, change the unordered list lest to green.
//Only when all requirements are satisfied can the user register with this password and a valid email. 
function checkValidation(pw) {
  if (/[A-Z]/.test(pw)) {
    console.log("Uppercase");
    document.querySelector(".vl-upper").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-upper").style.color = "red";
  }

  if (/[a-z]/.test(pw)) {
    console.log("Lowercase");
    document.querySelector(".vl-lower").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-lower").style.color = "red";
  }

  if (/[0-9]/.test(pw)) {
    console.log("Number");
    document.querySelector(".vl-number").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-number").style.color = "red";
  }

  if (/[^A-Za-z0-9]/.test(pw)) {
    console.log("Symbol");
    document.querySelector(".vl-symbol").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-symbol").style.color = "red";
  }

  if (pw.length > 8) {
    document.querySelector(".vl-length").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-length").style.color = "red";
  }
}
```
</div>

<br>

<div>
  Here is the strategy used for logging in users and starting a login session

  ```javascript
export function configurePassport(db) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log("Attempting to login user...");
          const { rows } = await db.query(
            "SELECT id, email, password FROM users WHERE email = $1",
            [email]
          );
          if (!rows.length) {
            return done(null, false, { message: "User not found" }); //If no users are found, return a user not found error message
          }
          const user = rows[0];
          const valid = await bcrypt.compare(password, user.password); //If a user is found, compare passwords using bcrypt
      
          if (!valid) {
            console.log("Incorrect password");
            return done(null, false, { message: "Incorrect password" }); //Incorrect passwords also return an error as it should
          }

          return done(null, user);
        } catch (error) {
          console.log(`An error occured in configurePassport: ${error}`);
          return done(error);
        }
      }
    )
  );
```
</div>

<div>
  <img height="350" alt="Screenshot 2026-03-04 153002" src="https://github.com/user-attachments/assets/dc562571-5be1-43dd-a175-089f80229b5b" />
  <img height="350" alt="Screenshot 2026-03-04 153035" src="https://github.com/user-attachments/assets/5933ab3f-f985-4781-8e69-5df64f6e841d" />
</div>
