const express = require("express");
const router = express.Router();

// Simple test route
router.get("/test", (req, res) => {
  res.send("<h1>Simple User Test Page</h1><p>This is working!</p>");
});

// Another test that tries to render a simple template
router.get("/test2", (req, res) => {
  try {
    res.render("admin/dashboard"); // Try rendering the dashboard which we know works
  } catch (error) {
    res.send("Error rendering dashboard: " + error.message);
  }
});

module.exports = router;
