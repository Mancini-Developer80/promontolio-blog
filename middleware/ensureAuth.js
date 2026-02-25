// middleware/ensureAuth.js

module.exports = function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // Se non è autenticato, lo mandiamo al login
  req.flash(
    "error_msg",
    "Per favore effettua il login per accedere a questa risorsa",
  );
  res.redirect("/auth/login");
};
