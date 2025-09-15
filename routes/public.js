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
router.get("/", getHome);

// About
router.get("/about", getAbout);

// Product
router.get("/product", getProduct);

// Contact
router.get("/contact", getContact);

// SEO-friendly pagination route (MUST come before blog and slug routes)
router.get("/blog/page/:page", (req, res) => {
  const page = parseInt(req.params.page);

  if (isNaN(page) || page < 1) {
    return res.redirect("/blog");
  }

  req.query.page = page.toString();
  getBlog(req, res);
});

// Blog List
router.get("/blog", (req, res) => {
  getBlog(req, res);
});

// Single Blog Post by slug
router.get("/blog/:slug", (req, res, next) => {
  if (req.params.slug === "page") {
    return next();
  }
  blogController.view(req, res, next);
});

module.exports = router;
