const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const {
  userValidation,
  passwordChangeValidation,
} = require("../../middleware/validation");
const { passwordResetLimiter } = require("../../middleware/rateLimiter");

// List users - simple version that works
router.get("/", async (req, res) => {
  try {
    // Basic user listing without complex filtering for now
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(20);

    // Basic stats
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ status: "active" }),
      inactive: await User.countDocuments({ status: "inactive" }),
      admins: await User.countDocuments({ role: { $in: ["admin", "super"] } }),
      authors: await User.countDocuments({ role: "author" }),
      editors: await User.countDocuments({ role: "editor" }),
    };

    res.render("admin/userListSimple", {
      users,
      stats,
      user: req.user,
      currentPage: 1,
      totalPages: 1,
      limit: 20,
      query: {},
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    req.flash("error", "Errore nel caricamento degli utenti");
    res.redirect("/admin/dashboard");
  }
});

// Show new user form
router.get("/new", (req, res) => {
  res.render("admin/userForm", {
    user: req.user,
    userToEdit: null,
    formAction: "/admin/users/new",
    pageTitle: "Nuovo Utente",
    success_msg: req.flash("success"),
    error_msg: req.flash("error"),
  });
});

// Create new user - basic version with validation
router.post("/new", userValidation.create, async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      password,
      role,
      bio,
      status = "active",
    } = req.body;

    // Check if user already exists (email or username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      req.flash("error", "Un utente con questa email o username esiste già");
      return res.redirect("/admin/users/new");
    }

    const userData = {
      username,
      firstName,
      lastName,
      email,
      password,
      role: role || "author",
      bio,
      status,
    };

    const user = new User(userData);
    await user.save();

    req.flash(
      "success",
      `Utente ${username} (${firstName} ${lastName}) creato con successo`
    );
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error creating user:", error);
    req.flash("error", "Errore nella creazione dell'utente");
    res.redirect("/admin/users/new");
  }
});

// Delete user
router.post("/:id/delete", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash("error", "Utente non trovato");
      return res.redirect("/admin/users");
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      req.flash("error", "Non puoi eliminare il tuo stesso account");
      return res.redirect("/admin/users");
    }

    await User.findByIdAndDelete(userId);

    req.flash(
      "success",
      `Utente ${user.firstName} ${user.lastName} eliminato con successo`
    );
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    req.flash("error", "Errore nell'eliminazione dell'utente");
    res.redirect("/admin/users");
  }
});

// Toggle user status
router.post("/:id/toggle-status", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash("error", "Utente non trovato");
      return res.redirect("/admin/users");
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      req.flash("error", "Non puoi disattivare il tuo stesso account");
      return res.redirect("/admin/users");
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    const statusText = user.status === "active" ? "attivato" : "disattivato";
    req.flash(
      "success",
      `Utente ${user.firstName} ${user.lastName} ${statusText} con successo`
    );
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error toggling user status:", error);
    req.flash("error", "Errore nella modifica dello status dell'utente");
    res.redirect("/admin/users");
  }
});

module.exports = router;
