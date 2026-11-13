const prisma = require("../db");

exports.viewDashboard = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Eseguiamo le query base in parallelo per massimizzare le performance di Postgres
    const [
      totalPosts,
      totalSubscribers,
      postsThisMonth,
      recentSubscribersCount,
      recentPosts,
      recentSubscribersList,
      recentContactMessages,
      leadStatusCounts,
      leadSourceCounts,
      topPosts,
      totalViewsData,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.lead.count(), // Assumendo che 'Subscriber' sia diventato 'Lead' nello schema
      prisma.article.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { title: true, createdAt: true },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { email: true, createdAt: true, status: true, source: true },
      }),
      prisma.contactMessage.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          name: true,
          email: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
      }),
      prisma.article.findMany({
        take: 10,
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
        select: { title: true, viewCount: true, category: true, slug: true },
      }),
      prisma.article.aggregate({
        _sum: { viewCount: true },
      }),
    ]);

    // Analytics: Raggruppamento per Categoria
    const postsByCategoryRaw = await prisma.article.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
      take: 8,
    });

    const postsByCategory = postsByCategoryRaw.map((item) => ({
      _id: item.category,
      count: item._count._all,
    }));

    // Analytics complessa: Conteggio per mese (Ultimi 6 mesi)
    // Prisma non supporta ancora nativamente il raggruppamento per 'Month' in modo semplice,
    // quindi usiamo queryRaw per sfruttare la potenza di PostgreSQL
    const postsPerMonth = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year, 
        EXTRACT(MONTH FROM "createdAt") as month, 
        COUNT(*)::int as count
      FROM "Article"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY year, month
      ORDER BY year ASC, month ASC
    `;

    const subscribersPerMonth = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year, 
        EXTRACT(MONTH FROM "createdAt") as month, 
        COUNT(*)::int as count
      FROM "Lead"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY year, month
      ORDER BY year ASC, month ASC
    `;

    res.render("admin/dashboard", {
      title: "Dashboard Promontolio",
      user: req.user,
      path: "/admin/dashboard",
      stats: {
        totalPosts,
        totalSubscribers,
        postsThisMonth,
        recentSubscribers: recentSubscribersCount,
        recentPosts,
        recentSubscribersList,
        recentContactMessages,
        leadStatusCounts,
        leadSourceCounts,
      },
      analytics: {
        postsPerMonth,
        subscribersPerMonth,
        postsByCategory,
        topPosts,
        totalViews: totalViewsData._sum.viewCount || 0,
        avgPostsPerMonth: totalPosts > 0 ? (totalPosts / 12).toFixed(1) : 0,
        popularCategory: postsByCategory.length > 0 ? postsByCategory[0] : null,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res
      .status(500)
      .render("admin/dashboard", { error: "Errore nel caricamento dati." });
  }
};

exports.fetchStats = async (req, res) => {
  try {
    // Per ora restituiamo un successo vuoto per non far crashare le chart nel frontend
    res.json({ success: true, message: "Stats API ready" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
