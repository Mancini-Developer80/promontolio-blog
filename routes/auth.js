// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter");
const { loginValidation } = require("../middleware/validation");

router.get("/login", authController.showLoginPage);

router.post(
  "/login",
  loginLimiter,
  loginValidation,
  authController.handleLogin,
);

router.get("/logout", authController.handleLogout);

module.exports = router;
