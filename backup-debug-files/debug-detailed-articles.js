// Enhanced debug script to check article content details
require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

async function debugArticleContent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const articles = await Article.find({ status: "published" });

    console.log(`\nFound ${articles.length} published articles:`);

    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(
        `   Excerpt length: ${
          article.excerpt ? article.excerpt.length : 0
        } characters`
      );
      console.log(
        `   Content length: ${
          article.content ? article.content.length : 0
        } characters`
      );
      console.log(`   Excerpt: "${article.excerpt || "No excerpt"}"`);
      console.log(
        `   Content (first 350 chars): "${
          article.content ? article.content.substring(0, 350) : "No content"
        }"`
      );
      console.log("---");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

debugArticleContent();
