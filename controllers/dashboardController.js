// controllers/dashboardController.js
const Article = require("../models/Article");
const Subscriber = require("../models/Subscriber");

// Render the Dashboard page (GET /admin/dashboard)
exports.viewDashboard = async (req, res) => {
  try {
    // Basic counts for display
    const totalPosts = await Article.countDocuments();
    const totalSubscribers = await Subscriber.countDocuments();

    res.render("admin/dashboard", {
      title: "Dashboard",
      stats: {
        totalPosts,
        totalSubscribers,
      },
    });
  } catch (err) {
    console.error("Dashboard render error:", err);
    res.status(500).render("admin/dashboard", {
      title: "Dashboard",
      stats: {},
      error: "Unable to load dashboard.",
    });
  }
};

// Return JSON stats for charts (GET /admin/dashboard/stats)
exports.fetchStats = async (req, res) => {
  try {
    // Example: posts per month for the last 6 months
    const pipeline = [
      { $match: {} },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];
    const monthData = await Article.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        postsByMonth: monthData,
      },
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ success: false, message: "Error loading stats." });
  }
};
