require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

async function checkArticles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const count = await Article.countDocuments();
    console.log("Total articles:", count);

    const articles = await Article.find().sort({ createdAt: -1 }).limit(10);
    console.log("Recent articles:");
    articles.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title} (${a.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkArticles();
