require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function updateSuperuserPassword() {
  try {
    // Prevent running in production
    if (process.env.NODE_ENV === "production") {
      console.log("❌ This script should not be run in production!");
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Find the superuser
    const superuser = await User.findOne({ role: "super" });
    if (!superuser) {
      console.log("❌ No superuser found. Create one first.");
      process.exit(0);
    }

    // Update password
    const newPassword =
      process.env.SUPER_PASSWORD || "YourNewSecurePassword123!";
    superuser.password = newPassword;
    await superuser.save();

    console.log("✅ Superuser password updated successfully!");
    console.log("Username:", superuser.username);
    console.log("New Password:", newPassword);
  } catch (error) {
    console.error("❌ Error updating password:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

updateSuperuserPassword();
