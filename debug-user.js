require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function checkUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the superuser
    const user = await User.findOne({ username: "promontolio_admin" });
    if (user) {
      console.log("User found:");
      console.log("Username:", user.username);
      console.log("Email:", user.email);
      console.log("Role:", user.role);
      console.log("Created:", user.createdAt);

      // Test password
      const testPassword = "DonChisciotte80";
      const isMatch = await user.comparePassword(testPassword);
      console.log("Password test with 'DonChisciotte80':", isMatch);
    } else {
      console.log("User not found!");

      // Check all users
      const allUsers = await User.find({});
      console.log("All users in database:", allUsers.length);
      allUsers.forEach((u) => {
        console.log(`- ${u.username} (${u.role})`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkUser();
