// routes/public.js
const // Contact
router.get("/contact", getContact);

// SEO-friendly pagination route (MUST come before blog and slug routes)
router.get("/blog/page/:page", (req, res) => {
  console.log("🔥🔥🔥 PAGINATION /blog/page/:page route hit - params:", req.params, "query:", req.query);
  console.log("🔥🔥🔥 Request URL:", req.url, "Original URL:", req.originalUrl);
  const page = parseInt(req.params.page);
  console.log("🔢 Parsed page number:", page);
  
  if (isNaN(page) || page < 1) {
    console.log("❌ Invalid page number, redirecting to /blog");
    return res.redirect("/blog");
  }
  
  // Set the page in query and call getBlog
  req.query.page = page.toString(); // Ensure it's a string
  console.log("📝 Setting req.query.page to:", req.query.page);
  getBlog(req, res);
});

// Blog List with pagination support
router.get("/blog", (req, res) => {
  console.log("🔥🔥🔥 MAIN /blog route hit - query:", req.query, "params:", req.params);
  console.log("🔥🔥🔥 Request URL:", req.url, "Original URL:", req.originalUrl);
  getBlog(req, res);
}); require("express");
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

// Blog List with pagination support
router.get("/blog", (req, res) => {
  console.log("�🔥🔥 MAIN /blog route hit - query:", req.query, "params:", req.params);
  console.log("🔥🔥🔥 Request URL:", req.url, "Original URL:", req.originalUrl);
  getBlog(req, res);
});

// TEST ROUTE - Remove this after debugging
router.get("/test-pagination/:page", (req, res) => {
  console.log("🧪 TEST ROUTE HIT - params:", req.params);
  res.json({ 
    message: "Test route working", 
    params: req.params, 
    query: req.query 
  });
});

// SEO-friendly pagination route (must come before slug route)
router.get("/blog/page/:page", (req, res) => {
  console.log("�🔥🔥 PAGINATION /blog/page/:page route hit - params:", req.params, "query:", req.query);
  console.log("🔥🔥🔥 Request URL:", req.url, "Original URL:", req.originalUrl);
  const page = parseInt(req.params.page);
  console.log("🔢 Parsed page number:", page);
  
  if (isNaN(page) || page < 1) {
    console.log("❌ Invalid page number, redirecting to /blog");
    return res.redirect("/blog");
  }
  
  // Set the page in query and call getBlog
  req.query.page = page.toString(); // Ensure it's a string
  console.log("📝 Setting req.query.page to:", req.query.page);
  getBlog(req, res);
});

// Single Blog Post by slug (must come after specific routes and NOT match 'page')
router.get("/blog/:slug", (req, res, next) => {
  // Don't handle if slug is 'page' (reserved for pagination)
  if (req.params.slug === 'page') {
    return next(); // Let other routes handle this
  }
  blogController.view(req, res, next);
});

module.exports = router;
