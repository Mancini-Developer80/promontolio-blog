const mongoose = require("mongoose");

// Database indexes setup
const setupIndexes = async () => {
  try {
    console.log("Setting up database indexes...");

    // Get model references
    const User = mongoose.model("User");
    const Article = mongoose.model("Article");
    const Media = mongoose.model("Media");
    const Subscriber = mongoose.model("Subscriber");

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1, status: 1 });
    await User.collection.createIndex({ status: 1 });
    await User.collection.createIndex({ lastLogin: -1 });
    await User.collection.createIndex({ passwordResetToken: 1 });
    await User.collection.createIndex({ passwordResetExpires: 1 });

    // Article indexes
    await Article.collection.createIndex({ slug: 1 }, { unique: true });
    await Article.collection.createIndex({ status: 1, createdAt: -1 });
    await Article.collection.createIndex({ author: 1, status: 1 });
    await Article.collection.createIndex({ category: 1, status: 1 });
    await Article.collection.createIndex({ createdAt: -1 });
    await Article.collection.createIndex({ updatedAt: -1 });
    await Article.collection.createIndex({
      title: "text",
      content: "text",
      excerpt: "text",
    });

    // Media indexes (if Media model exists)
    try {
      await Media.collection.createIndex({ uploadedBy: 1 });
      await Media.collection.createIndex({ fileType: 1 });
      await Media.collection.createIndex({ uploadDate: -1 });
      await Media.collection.createIndex({ originalName: 1 });
    } catch (err) {
      console.log("Media model not found, skipping media indexes");
    }

    // Subscriber indexes (if Subscriber model exists)
    try {
      await Subscriber.collection.createIndex({ email: 1 }, { unique: true });
      await Subscriber.collection.createIndex({ createdAt: -1 });
      await Subscriber.collection.createIndex({ status: 1 });
    } catch (err) {
      console.log("Subscriber model not found, skipping subscriber indexes");
    }

    console.log("✅ Database indexes created successfully");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
  }
};

// Database connection with improved error handling
const connectDB = async () => {
  try {
    // Remove deprecated options
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Setup indexes after connection
    await setupIndexes();

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error during database disconnection:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
