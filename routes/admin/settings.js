const express = require("express");
const router = express.Router();
const settingsController = require("../../controllers/settingsController");
console.log("Controller importato:", settingsController);
const ensureAuth = require("../../middleware/ensureAuth");
const ensureRole = require("../../middleware/ensureRole");

// Visualizza impostazioni (Admin/Super)
router.get(
  "/",
  ensureAuth,
  ensureRole(["admin", "super"]),
  settingsController.getSettings,
);

// Salva impostazioni su DB Prisma
router.post(
  "/",
  ensureAuth,
  ensureRole(["admin", "super"]),
  settingsController.updateSettings,
);

module.exports = router;
