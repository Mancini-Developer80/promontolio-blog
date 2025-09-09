// routes/admin/blog.js
const express = require("express");
const router = express.Router();
const blogController = require("../../controllers/blogController");

// List articles in admin panel
router.get("/", blogController.adminList);

// Show “New Article” form
router.get("/new", blogController.newForm);

// Create article
router.post("/new", blogController.create);

// Show “Edit Article” form
router.get("/:id/edit", blogController.editForm);

// Update article
router.post("/:id/edit", blogController.update);

// Delete article
router.post("/:id/delete", blogController.remove);

module.exports = router;
