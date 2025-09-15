// Script to add author references to existing articles
require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");
const User = require("./models/User");

async function addAuthorsToArticles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the user to use as author
    const author = await User.findOne({ role: "super" });
    if (!author) {
      console.log("No super user found to use as author");
      return;
    }

    console.log(`Found author: ${author.username}`);

    // Find all articles without author or with invalid author
    const articles = await Article.find({});
    console.log(`Found ${articles.length} articles to update`);

    // Update all articles to have this author
    const result = await Article.updateMany({}, { author: author._id });

    console.log(
      `Updated ${result.modifiedCount} articles with author information`
    );

    // Verify the update by fetching articles with populated author
    const updatedArticles = await Article.find({}).populate(
      "author",
      "username"
    );
    console.log("\nUpdated articles:");
    updatedArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(
        `   Author: ${article.author ? article.author.username : "No author"}`
      );
      console.log("---");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

addAuthorsToArticles();
