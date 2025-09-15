require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");
const User = require("./models/User");

async function addMoreArticles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get admin user
    const admin = await User.findOne({ role: "super" });
    if (!admin) {
      console.log("❌ No admin user found!");
      return;
    }

    const moreArticles = [
      {
        title: "Best Olive Oil Storage Methods",
        slug: "best-olive-oil-storage-methods",
        content:
          "Learn how to properly store your olive oil to maintain its quality and flavor...",
        excerpt:
          "Essential tips for storing olive oil to preserve its quality.",
        status: "published",
        author: admin._id,
        category: "olive-oil-guide",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
      {
        title: "Olive Oil Production in Puglia",
        slug: "olive-oil-production-puglia",
        content:
          "Discover the rich tradition of olive oil production in Puglia region...",
        excerpt:
          "Exploring the traditional olive oil production methods in Puglia.",
        status: "published",
        author: admin._id,
        category: "production",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
      {
        title: "Cooking with Extra Virgin Olive Oil",
        slug: "cooking-extra-virgin-olive-oil",
        content:
          "Tips and techniques for cooking with extra virgin olive oil...",
        excerpt: "Master the art of cooking with extra virgin olive oil.",
        status: "published",
        author: admin._id,
        category: "recipes",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
      {
        title: "Olive Oil and Heart Health",
        slug: "olive-oil-heart-health",
        content:
          "Scientific research on olive oil benefits for cardiovascular health...",
        excerpt: "How olive oil supports heart health according to research.",
        status: "published",
        author: admin._id,
        category: "health-benefits",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
      {
        title: "Organic vs Conventional Olive Oil",
        slug: "organic-vs-conventional-olive-oil",
        content:
          "Understanding the differences between organic and conventional olive oil...",
        excerpt:
          "Compare organic and conventional olive oil production methods.",
        status: "published",
        author: admin._id,
        category: "olive-oil-guide",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
      {
        title: "Olive Harvest News 2025",
        slug: "olive-harvest-news-2025",
        content:
          "Latest news and updates from the 2025 olive harvest season...",
        excerpt: "Stay updated with the latest olive harvest news.",
        status: "published",
        author: admin._id,
        category: "news",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
      {
        title: "How to Taste Olive Oil Like a Pro",
        slug: "how-to-taste-olive-oil-pro",
        content:
          "Professional techniques for tasting and evaluating olive oil quality...",
        excerpt: "Learn professional olive oil tasting techniques.",
        status: "published",
        author: admin._id,
        category: "olive-oil-guide",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
      {
        title: "Traditional Olive Oil Production Methods",
        slug: "traditional-olive-oil-production-methods",
        content: "Exploring traditional methods of olive oil production...",
        excerpt: "Traditional approaches to olive oil production.",
        status: "published",
        author: admin._id,
        category: "production",
        viewCount: Math.floor(Math.random() * 100) + 20,
      },
    ];

    // Add random dates from the past 3 months
    moreArticles.forEach((article) => {
      const randomDays = Math.floor(Math.random() * 90);
      article.createdAt = new Date(
        Date.now() - randomDays * 24 * 60 * 60 * 1000
      );
    });

    const createdArticles = await Article.insertMany(moreArticles);
    console.log(
      `✅ Created ${createdArticles.length} additional published articles`
    );

    const totalPublished = await Article.countDocuments({
      status: "published",
    });
    console.log(`📊 Total published articles: ${totalPublished}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addMoreArticles();
