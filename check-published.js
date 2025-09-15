require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

async function checkPublishedArticles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const publishedCount = await Article.countDocuments({
      status: "published",
    });
    console.log("Published articles:", publishedCount);

    const published = await Article.find({ status: "published" }).sort({
      createdAt: -1,
    });
    console.log("Published articles list:");
    published.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`);
    });

    console.log(
      `\nWith 6 articles per page, we should have ${Math.ceil(
        publishedCount / 6
      )} pages`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkPublishedArticles();
