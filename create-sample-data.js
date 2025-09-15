require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");
const Subscriber = require("./models/Subscriber");
const User = require("./models/User");

async function createSampleData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get the admin user
    const admin = await User.findOne({ role: "super" });
    if (!admin) {
      console.log("❌ No admin user found! Please create one first.");
      return;
    }

    console.log("🎯 Creating sample data for analytics testing...");

    // Create sample articles with different dates and categories
    const sampleArticles = [
      {
        title: "The Ultimate Guide to Extra Virgin Olive Oil",
        slug: "ultimate-guide-extra-virgin-olive-oil",
        content:
          "Learn everything about extra virgin olive oil production, quality indicators, and health benefits...",
        excerpt:
          "Complete guide to understanding extra virgin olive oil quality and benefits.",
        status: "published",
        category: "olive-oil-guide",
        author: admin._id,
        createdAt: new Date(2025, 6, 15), // July 2025
        metaDescription: "Complete guide to extra virgin olive oil",
      },
      {
        title: "Mediterranean Olive Oil Pasta Recipe",
        slug: "mediterranean-olive-oil-pasta-recipe",
        content:
          "A delicious pasta recipe featuring premium olive oil from Puglia...",
        excerpt: "Traditional Mediterranean pasta with high-quality olive oil.",
        status: "published",
        category: "recipes",
        author: admin._id,
        createdAt: new Date(2025, 7, 5), // August 2025
        metaDescription: "Mediterranean pasta recipe with olive oil",
      },
      {
        title: "Health Benefits of Olive Oil",
        slug: "health-benefits-olive-oil",
        content:
          "Scientific research on olive oil's impact on heart health, brain function...",
        excerpt:
          "Evidence-based health benefits of consuming quality olive oil.",
        status: "published",
        category: "health-benefits",
        author: admin._id,
        createdAt: new Date(2025, 8, 10), // September 2025
        metaDescription: "Scientific health benefits of olive oil",
      },
      {
        title: "Traditional vs Modern Olive Oil Production",
        slug: "traditional-vs-modern-olive-oil-production",
        content:
          "Comparing traditional stone mills with modern centrifugal extraction...",
        excerpt: "Analysis of different olive oil production methods.",
        status: "published",
        category: "production",
        author: admin._id,
        createdAt: new Date(2025, 8, 20), // September 2025
        metaDescription: "Olive oil production methods comparison",
      },
      {
        title: "2025 Olive Harvest Season Update",
        slug: "2025-olive-harvest-season-update",
        content:
          "Latest news from our olive groves and this year's harvest expectations...",
        excerpt: "Updates on the 2025 olive harvest season.",
        status: "draft",
        category: "news",
        author: admin._id,
        createdAt: new Date(2025, 8, 25), // September 2025
        metaDescription: "2025 olive harvest news",
      },
      {
        title: "Olive Oil Tasting Guide for Beginners",
        slug: "olive-oil-tasting-guide-beginners",
        content:
          "Learn how to properly taste and evaluate olive oil quality...",
        excerpt: "Beginner's guide to olive oil tasting techniques.",
        status: "draft",
        category: "olive-oil-guide",
        author: admin._id,
        createdAt: new Date(), // Today
        metaDescription: "How to taste olive oil properly",
      },
    ];

    // Create sample subscribers with different dates
    const sampleSubscribers = [
      { email: "maria.rossi@example.com", createdAt: new Date(2025, 5, 10) },
      { email: "carlo.bianchi@example.com", createdAt: new Date(2025, 6, 15) },
      {
        email: "francesco.verdi@example.com",
        createdAt: new Date(2025, 7, 20),
      },
      { email: "anna.neri@example.com", createdAt: new Date(2025, 8, 5) },
      {
        email: "giuseppe.gialli@example.com",
        createdAt: new Date(2025, 8, 15),
      },
      { email: "lucia.blu@example.com", createdAt: new Date(2025, 8, 25) },
      { email: "marco.viola@example.com", createdAt: new Date() },
    ];

    // Clear existing data
    await Article.deleteMany({});
    await Subscriber.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Insert sample articles
    await Article.insertMany(sampleArticles);
    console.log(`✅ Created ${sampleArticles.length} sample articles`);

    // Insert sample subscribers
    await Subscriber.insertMany(sampleSubscribers);
    console.log(`✅ Created ${sampleSubscribers.length} sample subscribers`);

    console.log("\n📊 SAMPLE DATA CREATED:");
    console.log(
      `- ${
        sampleArticles.filter((a) => a.status === "published").length
      } Published Articles`
    );
    console.log(
      `- ${
        sampleArticles.filter((a) => a.status === "draft").length
      } Draft Articles`
    );
    console.log(`- ${sampleSubscribers.length} Newsletter Subscribers`);
    console.log(`- Articles span from July to September 2025`);
    console.log(
      `- Multiple categories: olive-oil-guide, recipes, health-benefits, production, news`
    );

    await mongoose.disconnect();
    console.log(
      "\n🎉 Sample data creation complete! Your analytics dashboard will now show charts with data!"
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

createSampleData();
