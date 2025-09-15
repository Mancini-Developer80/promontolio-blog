// routes/auth.js
const express = require("express");
const passport = require("passport");
const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimiter");
const { loginValidation } = require("../middleware/validation");

// Show login form
router.get("/login", (req, res) => {
  res.render("adminForm", {
    title: "Admin Login",
    metaDescription: "",
    metaKeywords: "",
    error: req.flash("error")[0], // Get the first error message
  });
});

// Process login with rate limiting and validation
router.post(
  "/login",
  loginLimiter,
  loginValidation,
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
