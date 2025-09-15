// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/* ── USER MANAGEMENT HANDLERS ─────────────────────────────────────────── */

// Display user list for admin
exports.adminList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      searchQuery = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { role: searchRegex },
        ],
      };
    }

    // Filter by role if specified
    if (req.query.role && req.query.role !== "all") {
      searchQuery.role = req.query.role;
    }

    // Filter by status if specified
    if (req.query.status && req.query.status !== "all") {
      searchQuery.status = req.query.status;
    }

    const users = await User.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");

    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get user statistics
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ status: "active" }),
      inactive: await User.countDocuments({ status: "inactive" }),
      admins: await User.countDocuments({ role: { $in: ["admin", "super"] } }),
      authors: await User.countDocuments({ role: "author" }),
      editors: await User.countDocuments({ role: "editor" }),
    };

    res.render("admin/userList", {
      users,
      stats,
      currentPage: page,
      totalPages,
      limit,
      query: req.query,
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    req.flash("error", "Errore nel caricamento degli utenti");
    res.redirect("/admin/dashboard");
  }
};

// Show "New User" form (GET /admin/users/new)
exports.newForm = (req, res) => {
  res.render("admin/userForm", {
    user: req.user,
    userToEdit: null,
    formAction: "/admin/users/new",
    pageTitle: "Nuovo Utente",
    success_msg: req.flash("success"),
    error_msg: req.flash("error"),
  });
};

// Create new user (POST /admin/users/new)
exports.create = async (req, res) => {
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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      req.flash("error", "Email o username già in uso");
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

    // Handle avatar upload
    if (req.file) {
      userData.avatar = `/uploads/${req.file.filename}`;
    }

    const newUser = new User(userData);
    await newUser.save();

    req.flash("success", "Utente creato con successo!");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error creating user:", error);
    req.flash("error", "Errore nella creazione dell'utente");
    res.redirect("/admin/users/new");
  }
};

// Show "Edit User" form (GET /admin/users/:id/edit)
exports.editForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      req.flash("error", "Utente non trovato");
      return res.redirect("/admin/users");
    }

    res.render("admin/userForm", {
      user: req.user,
      userToEdit: user,
      formAction: `/admin/users/${user._id}/edit`,
      pageTitle: "Modifica Utente",
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading user edit form:", error);
    req.flash("error", "Errore nel caricamento del form");
    res.redirect("/admin/users");
  }
};

// Update user (POST /admin/users/:id/edit)
exports.update = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash("error", "Utente non trovato");
      return res.redirect("/admin/users");
    }

    const { firstName, lastName, username, email, role, bio, status } =
      req.body;

    // Check for duplicate username/email (excluding current user)
    const existingUser = await User.findOne({
      $and: [{ _id: { $ne: userId } }, { $or: [{ email }, { username }] }],
    });

    if (existingUser) {
      req.flash("error", "Email o username già in uso da un altro utente");
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.email = email;
    user.role = role;
    user.bio = bio;
    user.status = status;

    // Handle avatar upload
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    req.flash("success", "Utente aggiornato con successo!");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error updating user:", error);
    req.flash("error", "Errore nell'aggiornamento dell'utente");
    res.redirect("/admin/users");
  }
};

// Delete user (POST /admin/users/:id/delete)
exports.remove = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash("error", "Utente non trovato");
      return res.redirect("/admin/users");
    }

    // Prevent deletion of super users
    if (user.role === "super") {
      req.flash("error", "Non è possibile eliminare un super utente");
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
};

// Reset user password
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash("error", "Utente non trovato");
      return res.redirect("/admin/users");
    }

    // Check permissions
    if (user.role === "super" && req.user.role !== "super") {
      req.flash(
        "error",
        "Non hai i permessi per reimpostare la password di questo utente"
      );
      return res.redirect("/admin/users");
    }

    // Generate secure temporary password
    const tempPassword = crypto.randomBytes(12).toString("hex").slice(0, 16);

    // Hash and save new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(tempPassword, salt);
    await user.save();

    // Log password reset action (without exposing the password)
    console.log(
      `Password reset for user: ${user.username} (${user.email}) by admin: ${req.user.username}`
    );

    req.flash(
      "success",
      `Password reimpostata con successo. La nuova password temporanea è stata generata e deve essere comunicata all'utente in modo sicuro.`
    );

    // In a production environment, you should:
    // 1. Send the password via secure email
    // 2. Use a password reset token instead
    // 3. Force password change on next login
    console.log(
      `SECURE: Temporary password for ${user.email}: ${tempPassword}`
    );

    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error resetting password:", error);
    req.flash("error", "Errore nella reimpostazione della password");
    res.redirect("/admin/users");
  }
};

// Toggle user status
exports.toggleStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash("error", "Utente non trovato");
      return res.redirect("/admin/users");
    }

    // Check permissions
    if (user.role === "super" && req.user.role !== "super") {
      req.flash(
        "error",
        "Non hai i permessi per modificare lo status di questo utente"
      );
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
};
