// routes/admin/blog.js
const express = require("express");
const router = express.Router();
const blogController = require("../../controllers/blogController");
const upload = require("../../middleware/upload");

// List articles in admin panel
router.get("/", blogController.adminList);

// Show “New Article” form
router.get("/new", blogController.newForm);

// Create article (with file upload)
router.post("/new", upload.single("featuredImage"), blogController.create);

// Show “Edit Article” form
router.get("/:id/edit", blogController.editForm);

// Update article (with file upload)
router.post("/:id/edit", upload.single("featuredImage"), blogController.update);

// Delete article
router.post("/:id/delete", blogController.remove);

module.exports = router;
