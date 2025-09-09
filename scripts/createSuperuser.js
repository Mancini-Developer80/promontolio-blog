require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function createSuperuser() {
  try {
    // Prevent running in production
    if (process.env.NODE_ENV === "production") {
      console.log("❌ This script should not be run in production!");
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB...");

    // Check if superuser already exists
    const existingSuperuser = await User.findOne({ role: "super" });
    if (existingSuperuser) {
      console.log("Superuser already exists:", existingSuperuser.username);
      process.exit(0);
    }

    // Create superuser
    const superuser = new User({
      username: process.env.SUPER_USERNAME || "admin",
      email: process.env.SUPER_EMAIL || "admin@example.com",
      password: process.env.SUPER_PASSWORD || "changeThisPassword123!",
      role: "super",
    });

    await superuser.save();
    console.log("✅ Superuser created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("⚠️  Remember to change the password after first login!");
  } catch (error) {
    console.error("❌ Error creating superuser:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

createSuperuser();
