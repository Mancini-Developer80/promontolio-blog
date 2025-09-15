const express = require("express");
const router = express.Router();
const ensureAuth = require("../../middleware/ensureAuth");
const ensureRole = require("../../middleware/ensureRole");
const mediaUpload = require("../../middleware/mediaUpload");
const mediaController = require("../../controllers/mediaController");

// All routes require authentication
router.use(ensureAuth);

// Media Library Dashboard
router.get("/", mediaController.mediaLibrary);

// Upload Form
router.get("/upload", mediaController.uploadForm);

// Media Details View
router.get("/:id", mediaController.mediaDetailsView);

// Handle Upload
router.post(
  "/upload",
  mediaUpload.single("mediaFile"),
  mediaController.uploadMedia
);

// Multiple file upload
router.post(
  "/upload-multiple",
  mediaUpload.multiple("mediaFiles", 10),
  mediaController.uploadMedia
);

// Get media details (API)
router.get("/api/:id", mediaController.getMediaDetails);

// Update media details
router.put("/api/:id", mediaController.updateMedia);

// Delete media
router.delete("/api/:id", ensureRole(["admin"]), mediaController.deleteMedia);

// Bulk operations (admin only)
router.post("/bulk", ensureRole(["admin"]), mediaController.bulkOperation);

// API endpoint for TinyMCE image list
router.get("/api/editor/images", mediaController.getMediaForEditor);

module.exports = router;
