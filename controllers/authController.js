// controllers/authController.js
const passport = require("passport");

exports.showLoginPage = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/admin/dashboard");
  }
  res.render("adminForm", {
    title: "Admin Login | Promontolio",
    metaDescription: "Accesso riservato alla gestione Promontolio",
    error_msg: req.flash("error"),
    success_msg: req.flash("success"),
  });
};

exports.handleLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
};

exports.handleLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Errore durante il logout:", err);
      return res.redirect("/admin/dashboard");
    }
    req.flash("success_msg", "Sei uscito correttamente.");
    res.redirect("/");
  });
};
