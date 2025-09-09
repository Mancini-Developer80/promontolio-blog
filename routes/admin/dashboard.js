// routes/admin/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboardController");

// Dashboard home (HTML page with embedded charts)
router.get("/", dashboardController.viewDashboard);

// API endpoint for chart data
router.get("/stats", dashboardController.fetchStats);

// User management
router.use("/users", require("./user"));

module.exports = router;
