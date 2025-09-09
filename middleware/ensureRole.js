module.exports = function ensureRole(roles = []) {
  return (req, res, next) => {
    if (
      req.isAuthenticated() &&
      (req.user.role === "super" || roles.includes(req.user.role))
    ) {
      return next();
    }
    res.redirect("/auth/login");
  };
};
