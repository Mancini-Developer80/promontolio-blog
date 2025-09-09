const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Attempting login for username:", username);
      console.log("Password received:", password);
      console.log("Password length:", password.length);

      const user = await User.findOne({ username });
      if (!user) {
        console.log("User not found");
        return done(null, false, { message: "User not found" });
      }

      console.log("User found, checking password...");
      const match = await user.comparePassword(password);
      console.log("Password comparison result:", match);

      if (!match) {
        console.log("Password doesn't match");
        return done(null, false, { message: "Incorrect password" });
      }

      console.log("Login successful for user:", user.username);

      // Record login (using the new method if available)
      if (user.recordLogin) {
        await user.recordLogin();
      }

      return done(null, user);
    } catch (err) {
      console.error("Passport error:", err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

exports = module.exports = passport;
