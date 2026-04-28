// routes/admin/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboardController");
const ensureRole = require("../../middleware/ensureRole");

// Dashboard home (HTML page with embedded charts)
router.get(
  "/",
  ensureRole(["admin", "super"]),
  dashboardController.viewDashboard,
);

// API endpoint for chart data
router.get(
  "/stats",
  ensureRole(["admin", "super"]),
  dashboardController.fetchStats,
);

module.exports = router;
