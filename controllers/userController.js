// Delete a user (admin or super, cannot delete self or a superuser unless you are super)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");
    // Prevent deleting self
    if (req.user._id.equals(user._id)) {
      return res.status(403).send("You cannot delete your own account.");
    }
    // Only superuser can delete another superuser
    if (user.role === "super" && req.user.role !== "super") {
      return res
        .status(403)
        .send("Only superuser can delete another superuser.");
    }
    await User.deleteOne({ _id: id });
    res.redirect("/admin/users");
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
};

// Reset user password (admin or super, cannot reset own password here)
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");
    // Prevent resetting own password here
    if (req.user._id.equals(user._id)) {
      return res.status(403).send("You cannot reset your own password here.");
    }
    // Only superuser can reset another superuser's password
    if (user.role === "super" && req.user.role !== "super") {
      return res
        .status(403)
        .send("Only superuser can reset another superuser's password.");
    }
    user.password = newPassword; // Assumes pre-save hook hashes password
    await user.save();
    res.redirect("/admin/users");
  } catch (err) {
    res.status(500).send("Error resetting user password");
  }
};
// controllers/userController.js
const User = require("../models/User");

// List all users (admin or super only)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username email role");
    res.render("admin/userList", { users, title: "User List" });
  } catch (err) {
    res.status(500).send("Error loading users");
  }
};

// Show user edit form (admin or super only)
exports.editUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.render("admin/userForm", {
      user,
      title: "Edit User",
      currentUser: req.user,
    });
  } catch (err) {
    res.status(500).send("Error loading user");
  }
};

// Update user role (only super can assign super, no one can assign themselves super)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");

    // Prevent users from changing their own role to super
    if (
      req.user._id.equals(user._id) &&
      role === "super" &&
      req.user.role !== "super"
    ) {
      return res.status(403).send("You cannot assign yourself superuser role.");
    }
    // Only superuser can assign super role
    if (role === "super" && req.user.role !== "super") {
      return res.status(403).send("Only superuser can assign super role.");
    }
    user.role = role;
    await user.save();
    res.redirect("/admin/users");
  } catch (err) {
    res.status(500).send("Error updating user role");
  }
};
