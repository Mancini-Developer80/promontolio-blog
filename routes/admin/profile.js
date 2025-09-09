const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

// Show user profile form
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.render("admin/profile", {
      user: req.user,
      profile: user,
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    req.flash("error", "Error loading profile");
    res.redirect("/admin/dashboard");
  }
});

// Update user profile
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      bio,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const user = await User.findById(req.user._id);

    // Check if username or email already exists (excluding current user)
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: req.user._id } },
        { $or: [{ email }, { username }] },
      ],
    });

    if (existingUser) {
      req.flash("error", "Username or email already exists");
      return res.redirect("/admin/profile");
    }

    // Update basic info
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.email = email;
    user.bio = bio;

    // Handle password change if provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        req.flash("error", "Current password is incorrect");
        return res.redirect("/admin/profile");
      }

      if (newPassword !== confirmPassword) {
        req.flash("error", "New passwords do not match");
        return res.redirect("/admin/profile");
      }

      if (newPassword.length < 6) {
        req.flash("error", "New password must be at least 6 characters");
        return res.redirect("/admin/profile");
      }

      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();
    req.flash("success", "Profile updated successfully");
    res.redirect("/admin/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    req.flash("error", "Error updating profile");
    res.redirect("/admin/profile");
  }
});

module.exports = router;
