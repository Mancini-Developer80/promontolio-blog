const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const upload = require("../../middleware/upload"); // Middleware per avatar
const ensureAuth = require("../../middleware/ensureAuth");
const ensureRole = require("../../middleware/ensureRole");

/* ── PROFILO PERSONALE (Accessibile a tutti gli utenti loggati) ── */

// Visualizza il proprio profilo
router.get("/profile", ensureAuth, userController.getProfile);

// Aggiorna il proprio profilo (con upload avatar opzionale)
router.post(
  "/profile",
  ensureAuth,
  upload.single("avatar"),
  userController.updateProfile,
);

/* ── MANAGEMENT UTENTI (Admin & Super Only) ─────────────────────── */

// Elenco utenti
router.get(
  "/",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.adminList,
);

// Form e creazione nuovo utente
router.get(
  "/new",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.newForm,
);
router.post(
  "/new",
  ensureAuth,
  ensureRole(["admin", "super"]),
  upload.single("avatar"),
  userController.create,
);

// Form e aggiornamento utente specifico
router.get(
  "/:id/edit",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.editForm,
);
router.post(
  "/:id/edit",
  ensureAuth,
  ensureRole(["admin", "super"]),
  upload.single("avatar"),
  userController.update,
);

// Azioni rapide (Delete, Reset, Toggle)
router.post(
  "/:id/delete",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.remove,
);
router.post(
  "/:id/reset-password",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.resetPassword,
);
router.post(
  "/:id/toggle-status",
  ensureAuth,
  ensureRole(["admin", "super"]),
  userController.toggleStatus,
);

module.exports = router;
