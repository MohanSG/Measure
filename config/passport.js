import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

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
            return done(null, false, { message: "User not found" });
          }
          const user = rows[0];
          const valid = await bcrypt.compare(password, user.password);
      
          if (!valid) {
            console.log("Incorrect password");
            return done(null, false, { message: "Incorrect password" });
          }

          return done(null, user);
        } catch (error) {
          console.log(`An error occured in configurePassport: ${error}`);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await db.query(
        "SELECT id, username, highscore FROM users WHERE id = $1",
        [id]
      );
      done(null, rows[0]);
    } catch (error) {
      console.log(`An error occured in deseralizeUser: ${error}`);
      done(error);
    }
  });
}
