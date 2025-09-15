require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");
const Subscriber = require("./models/Subscriber");

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check Articles
    const articles = await Article.find({});
    console.log(`\n📝 ARTICLES (${articles.length} total):`);

    if (articles.length > 0) {
      articles.forEach((article, index) => {
        console.log(
          `${index + 1}. "${article.title}" (${article.status}) - ${
            article.category || "No category"
          } - ${article.createdAt.toLocaleDateString()}`
        );
      });
    } else {
      console.log("⚠️ No articles found! Charts will be empty.");
    }

    // Check Subscribers
    const subscribers = await Subscriber.find({});
    console.log(`\n📧 SUBSCRIBERS (${subscribers.length} total):`);

    if (subscribers.length > 0) {
      subscribers.forEach((sub, index) => {
        console.log(
          `${index + 1}. ${sub.email} - ${sub.createdAt.toLocaleDateString()}`
        );
      });
    } else {
      console.log("⚠️ No subscribers found! Charts will be empty.");
    }

    // Check data for charts
    const publishedCount = await Article.countDocuments({
      status: "published",
    });
    const draftCount = await Article.countDocuments({ status: "draft" });

    console.log(`\n📊 CHART DATA SUMMARY:`);
    console.log(`- Published Posts: ${publishedCount}`);
    console.log(`- Draft Posts: ${draftCount}`);
    console.log(`- Total Subscribers: ${subscribers.length}`);

    await mongoose.disconnect();
    console.log("\n✅ Database check complete!");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkData();
