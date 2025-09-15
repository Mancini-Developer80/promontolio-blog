const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const upload = require("../../middleware/upload");
const ensureAuth = require("../../middleware/ensureAuth");
const ensureRole = require("../../middleware/ensureRole");

// List users (admin or super)
router.get("/", ensureAuth, userController.adminList);

// Show "New User" form
router.get(
  "/new",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.newForm
);

// Create user (with file upload)
router.post(
  "/new",
  ensureAuth,
  ensureRole(["admin", "super"]),
  upload.single("avatar"),
  userController.create
);

// Edit user form
router.get(
  "/:id/edit",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.editForm
);

// Update user (with file upload)
router.post(
  "/:id/edit",
  ensureAuth,
  ensureRole(["admin", "super"]),
  upload.single("avatar"),
  userController.update
);

// Delete user
router.post(
  "/:id/delete",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.remove
);

// Reset user password
router.post(
  "/:id/reset-password",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.resetPassword
);

// Toggle user status
router.post(
  "/:id/toggle-status",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.toggleStatus
);

module.exports = router;
