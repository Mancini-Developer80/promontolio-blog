// controllers/dashboardController.js
const Article = require("../models/Article");
const Subscriber = require("../models/Subscriber");

// Render the Dashboard page (GET /admin/dashboard)
exports.viewDashboard = async (req, res) => {
  try {
    // Basic counts
    const totalPosts = await Article.countDocuments();
    const totalSubscribers = await Subscriber.countDocuments();

    // Posts this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const postsThisMonth = await Article.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Recent subscribers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSubscribers = await Subscriber.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Recent posts (last 5)
    const recentPosts = await Article.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    // Recent subscribers list (last 5)
    const recentSubscribersList = await Subscriber.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("email createdAt");

    res.render("admin/dashboard", {
      title: "PromontolioBlog Dashboard",
      user: req.user, // Pass the authenticated user
      stats: {
        totalPosts,
        totalSubscribers,
        postsThisMonth,
        recentSubscribers,
        recentPosts,
        recentSubscribersList,
      },
    });
  } catch (err) {
    console.error("Dashboard render error:", err);
    res.status(500).render("admin/dashboard", {
      title: "Dashboard",
      user: req.user || { username: "Unknown", role: "user" },
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
