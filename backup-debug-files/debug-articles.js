require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function checkArticles() {
  try {
    console.log("Checking articles in database...");

    const allArticles = await Article.find();
    console.log(`Total articles in database: ${allArticles.length}`);

    const publishedArticles = await Article.find({ status: "published" });
    console.log(`Published articles: ${publishedArticles.length}`);

    if (publishedArticles.length > 0) {
      console.log("\nPublished articles:");
      publishedArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(
          `   Featured Image: ${article.featuredImage || "No image"}`
        );
        console.log(`   Status: ${article.status}`);
        console.log("---");
      });
    }

    // If no published articles, let's create a test one
    if (publishedArticles.length === 0) {
      console.log("\nNo published articles found. Creating a test article...");

      const testArticle = new Article({
        title: "Health Benefits of Extra Virgin Olive Oil",
        slug: "health-benefits-olive-oil",
        content:
          "Extra virgin olive oil is packed with healthy monounsaturated fats and antioxidants. It has been shown to reduce inflammation, support heart health, and provide numerous other benefits for overall wellness.",
        excerpt:
          "Discover the amazing health benefits of extra virgin olive oil and why it should be a staple in your Mediterranean diet.",
        status: "published",
        featuredImage: "/image/organic-olive-harvest-extra-virgin-oil.webp",
        author: null, // You might need to add a user ID here
      });

      await testArticle.save();
      console.log("Test article created successfully!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkArticles();
