const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const publicController = require("../controllers/publicController"); // Import completo per pulizia

const {
  getHome,
  getAbout,
  getContact,
  getProduct,
  getBlog,
  getImpressum,
  getDatenschutz,
  getGuideLanding,
  postSubscribe,
  handleContactForm,
  createCheckoutSession, // Aggiunta
  getSuccess, // Aggiunta
} = publicController;

// --- PUBLIC ROUTES ---
router.get("/", getHome);
router.get("/olivenoel-guide", getGuideLanding);
router.get("/about", getAbout);
router.get("/product", getProduct);
router.get("/contact", getContact);
router.get("/impressum", getImpressum);
router.get("/datenschutz", getDatenschutz);

// --- FORMS & NEWSLETTER ---
router.post("/subscribe", postSubscribe);
router.post("/contact", handleContactForm);

// --- STRIPE CHECKOUT ---
// Questa è la rotta chiamata dal fetch nel tuo cart.js
router.post("/create-checkout-session", createCheckoutSession);

// Questa è la pagina dove Stripe reindirizza l'utente dopo il pagamento
router.get("/success", getSuccess);

// --- BLOG LOGIC ---
// SEO-friendly pagination route
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
