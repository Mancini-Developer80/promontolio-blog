const express = require("express");
const router = express.Router();
const ensureAuth = require("../../middleware/ensureAuth");
const ensureRole = require("../../middleware/ensureRole");
const { mediaUpload } = require("../../middleware/mediaUpload");
const mediaController = require("../../controllers/mediaController");

// All routes require authentication
router.use(ensureAuth);

// Media Library Dashboard
router.get("/", mediaController.mediaLibrary);

// Upload Form
router.get("/upload", mediaController.uploadForm);

// Handle Upload
router.post(
  "/upload",
  mediaUpload.single("mediaFile"),
  mediaController.uploadMedia,
);

// Multiple file upload
router.post(
  "/upload-multiple",
  mediaUpload.array("mediaFiles", 10),
  mediaController.uploadMedia,
);

// Bulk operations (admin only)
router.post("/bulk", ensureRole(["admin"]), mediaController.bulkOperation);

// API endpoint for TinyMCE image list — must be before /api/:id to avoid shadowing
router.get("/api/editor/images", mediaController.getMediaForEditor);

// Get media details (API)
router.get("/api/:id", mediaController.getMediaDetails);

// Update media details
router.put("/api/:id", mediaController.updateMedia);

// Delete media
router.delete("/api/:id", ensureRole(["admin"]), mediaController.deleteMedia);

// Media Details View — dynamic route last to avoid shadowing /api/* routes
router.get("/:id", mediaController.mediaDetailsView);

module.exports = router;
