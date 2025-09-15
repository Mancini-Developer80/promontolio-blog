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

    // Enhanced Analytics for Charts
    // 1. Posts per month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const postsPerMonth = await Article.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 2. Subscribers growth over last 6 months
    const subscribersPerMonth = await Subscriber.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 3. Posts by category/tag
    const postsByCategory = await Article.aggregate([
      { $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // 4. Top performing posts with view counts
    const topPosts = await Article.find()
      .sort({ viewCount: -1, createdAt: -1 }) // Sort by views first, then by date
      .limit(10)
      .select("title createdAt viewCount category slug");

    // 5. Calculate engagement metrics
    const totalViews = await Article.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
    ]);

    // 6. Average posts per month
    const avgPostsPerMonth =
      totalPosts > 0 ? Math.round((totalPosts / 12) * 10) / 10 : 0;

    // 7. Most popular category
    const popularCategory =
      postsByCategory.length > 0 ? postsByCategory[0] : null;

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
      analytics: {
        postsPerMonth,
        subscribersPerMonth,
        postsByCategory,
        topPosts,
        totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
        avgPostsPerMonth,
        popularCategory,
      },
    });
  } catch (err) {
    console.error("Dashboard render error:", err);
    res.status(500).render("admin/dashboard", {
      title: "Dashboard",
      user: req.user || { username: "Unknown", role: "user" },
      stats: {},
      analytics: {
        postsPerMonth: [],
        subscribersPerMonth: [],
        postsByCategory: [],
        topPosts: [],
        totalViews: 0,
        avgPostsPerMonth: 0,
        popularCategory: null,
      },
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
