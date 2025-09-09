const express = require("express");
const router = express.Router();

// Basic test route
router.get("/", (req, res) => {
  res.send("User route works!");
});

module.exports = router;
