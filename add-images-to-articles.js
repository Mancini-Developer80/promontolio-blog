require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function addImagesToArticles() {
  try {
    console.log("Adding featured images to existing articles...");

    const articles = await Article.find({ status: "published" });

    const imageUrls = [
      "/image/organic-olive-harvest-extra-virgin-oil.webp",
      "/image/hilltop-olive-grove-overlooking-sea.webp",
      "/image/fresh-olive-harvest-on-wooden-table.webp",
      "/image/stone-olive-press-in-olive-grove.webp",
    ];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const imageUrl = imageUrls[i % imageUrls.length];

      await Article.findByIdAndUpdate(article._id, {
        featuredImage: imageUrl,
      });

      console.log(`Updated "${article.title}" with image: ${imageUrl}`);
    }

    console.log("\nAll articles updated with featured images!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

addImagesToArticles();
