// routes/admin/blog.js
const express = require("express");
const router = express.Router();
const blogController = require("../../controllers/blogController");
const upload = require("../../middleware/upload");
const ensureRole = require("../../middleware/ensureRole");

// List articles in admin panel
router.get("/", ensureRole(["admin", "super"]), blogController.adminList);

// Show "New Article" form
router.get("/new", ensureRole(["admin", "super"]), blogController.newForm);

// Create article (with file upload)
router.post("/new", ensureRole(["admin", "super"]), upload.single("featuredImage"), blogController.create);

// Show "Edit Article" form
router.get("/:id/edit", ensureRole(["admin", "super"]), blogController.editForm);

// Update article (with file upload)
router.post("/:id/edit", ensureRole(["admin", "super"]), upload.single("featuredImage"), blogController.update);

// Delete article
router.post("/:id/delete", ensureRole(["admin", "super"]), blogController.remove);

module.exports = router;
