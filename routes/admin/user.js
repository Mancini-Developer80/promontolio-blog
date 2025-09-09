const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const ensureAuth = require("../../middleware/ensureAuth");
const ensureRole = require("../../middleware/ensureRole");

// List users (admin or super)
router.get(
  "/",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.listUsers
);
// Edit user form
router.get(
  "/:id/edit",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.editUserForm
);
// Update user role
router.post(
  "/:id/edit",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.updateUserRole
);
// Delete user
router.post(
  "/:id/delete",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.deleteUser
);
// Reset user password
router.post(
  "/:id/reset-password",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.resetUserPassword
);

module.exports = router;
