// middleware/ensureRole.js

module.exports = function ensureRole(roles = []) {
  return (req, res, next) => {
    // 1. Verifichiamo se l'utente è loggato
    if (!req.isAuthenticated()) {
      return res.redirect("/auth/login");
    }

    // 2. Normalizziamo i ruoli richiesti in maiuscolo (per sicurezza)
    const authorizedRoles = roles.map((r) => r.toUpperCase());

    // 3. Controllo gerarchia: Il SUPER accede sempre a tutto.
    // Altrimenti controlliamo se il suo ruolo è tra quelli autorizzati.
    const userRole = req.user.role.toUpperCase();

    if (userRole === "SUPER" || authorizedRoles.includes(userRole)) {
      return next();
    }

    // 4. Se loggato ma non autorizzato
    req.flash(
      "error_msg",
      "Non hai i permessi necessari per visualizzare questa pagina",
    );
    res.redirect("/admin/dashboard");
  };
};
