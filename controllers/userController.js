const prisma = require("../db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/* ── PROFILE & ACCOUNT ─────────────────────────────────────────────── */

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.user.id) },
    });
    res.render("admin/profile", {
      title: "Il Mio Profilo",
      user: req.user,
      profile: user,
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    req.flash("error", "Errore nel caricamento profilo");
    res.redirect("/admin/dashboard");
  }
};

exports.updateProfile = async (req, res) => {
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
    const userId = parseInt(req.user.id);

    // Controllo unicità
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username }],
        NOT: { id: userId },
      },
    });

    if (existing) {
      req.flash("error", "Username o email già in uso");
      return res.redirect("/admin/profile");
    }

    let dataToUpdate = {
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      bio,
    };

    // Gestione Password
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        req.flash("error", "Le nuove password non coincidono");
        return res.redirect("/admin/profile");
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        req.flash("error", "Password attuale errata");
        return res.redirect("/admin/profile");
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 12);
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    req.flash("success", "Profilo aggiornato con successo");
    res.redirect("/admin/profile");
  } catch (error) {
    console.error("Update profile error:", error);
    req.flash("error", "Errore durante l'aggiornamento");
    res.redirect("/admin/profile");
  }
};

/* ── USER MANAGEMENT (CRUD) ────────────────────────────────────────── */

exports.adminList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let where = {};
    if (req.query.search) {
      const search = req.query.search;
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (req.query.role && req.query.role !== "all") {
      where.role = req.query.role.toUpperCase();
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const stats = {
      total: totalUsers,
      active: await prisma.user.count({ where: { status: "ACTIVE" } }),
      admins: await prisma.user.count({
        where: { role: { in: ["ADMIN", "SUPER"] } },
      }),
    };

    res.render("admin/userList", {
      title: "Gestione Utenti", // <--- RISOLVE IL REFERENCE ERROR
      user: req.user, // <--- NECESSARIO PER IL CONFRONTO ID NEL TEMPLATE
      users,
      stats,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      query: req.query,
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    req.flash("error", "Errore nel caricamento utenti");
    res.redirect("/admin/dashboard");
  }
};

exports.create = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, bio } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      req.flash("error", "Email già registrata");
      return res.redirect("/admin/users/new");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role.toUpperCase(),
        bio,
        status: "ACTIVE",
        username: email.split("@")[0], // Default username
      },
    });

    req.flash("success", "Utente creato con successo");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Create user error:", error);
    res.redirect("/admin/users/new");
  }
};

exports.update = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { firstName, lastName, email, role, status, bio } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        role: role.toUpperCase(),
        status: status.toUpperCase(),
        bio,
      },
    });

    req.flash("success", "Utente aggiornato");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Update error:", error);
    res.redirect("/admin/users");
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === parseInt(req.user.id)) {
      req.flash("error", "Non puoi eliminare te stesso");
      return res.redirect("/admin/users");
    }
    await prisma.user.delete({ where: { id: userId } });
    req.flash("success", "Utente eliminato");
    res.redirect("/admin/users");
  } catch (error) {
    req.flash("error", "Errore durante l'eliminazione");
    res.redirect("/admin/users");
  }
};

/* ── FORM HELPERS ────────────────────────────────────────────────── */

exports.newForm = (req, res) => {
  res.render("admin/userForm", {
    user: null,
    userToEdit: null,
    formAction: "/admin/users/new",
    pageTitle: "Nuovo Utente",
  });
};

exports.editForm = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    res.render("admin/userForm", {
      user,
      userToEdit: user,
      formAction: `/admin/users/${user.id}/edit`,
      pageTitle: "Modifica Utente",
    });
  } catch (e) {
    res.redirect("/admin/users");
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const defaultPassword = await bcrypt.hash("Promontolio2026!", 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: defaultPassword, mustChangePassword: true },
    });
    req.flash("success", "Password resettata a: Promontolio2026!");
    res.redirect("/admin/users");
  } catch (error) {
    res.redirect("/admin/users");
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });
    req.flash("success", `Stato utente aggiornato a ${newStatus}`);
    res.redirect("/admin/users");
  } catch (error) {
    res.redirect("/admin/users");
  }
};

module.exports = {
  getProfile: exports.getProfile,
  updateProfile: exports.updateProfile,
  adminList: exports.adminList,
  newForm: exports.newForm,
  create: exports.create,
  editForm: exports.editForm,
  update: exports.update,
  remove: exports.remove,
  resetPassword: exports.resetPassword,
  toggleStatus: exports.toggleStatus,
};
