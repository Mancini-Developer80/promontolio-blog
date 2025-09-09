// routes/public.js
const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const {
  getHome,
  getAbout,
  getContact,
  getProduct,
  getBlog,
} = require("../controllers/publicController");

// Home

// Home
router.get("/", getHome);

// About Us

// About Us
router.get("/about", getAbout);

// Product

// Product
router.get("/product", getProduct);

// Contact
router.get("/contact", getContact);

// Blog List

// Blog List
router.get("/blog", getBlog);

// Single Blog Post by slug

// Single Blog Post by slug (keep using blogController)
router.get("/blog/:slug", blogController.view);

module.exports = router;
