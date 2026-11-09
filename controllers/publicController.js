// controllers/publicController.js
const prisma = require("../db"); // Il nostro client centralizzato
const path = require("path");
const {
  sendWelcomePDF,
  sendContactMessage,
} = require("../services/emailService");
const { getPageByRoute } = require("../config/i18n");

// Configurazione Prodotti (Single Source of Truth)
const PRODUCTS = {
  "oil-bundle-6": {
    amount: 9600, // In centesimi (96,00 €)
    bundleIndex: 0,
  },
  "oil-bundle-12": {
    amount: 19200, // In centesimi (192,00 €)
    bundleIndex: 1,
  },
};

function getPage(req, routePath) {
  const locale = req.res && req.res.locals ? req.res.locals.locale : "de";
  return getPageByRoute(locale, routePath) || {};
}

function renderPage(req, res, view, routePath, fallback = {}) {
  const page = getPage(req, routePath);
  const content = page.content || {};
  const metaTags = page.metaTags || {};

  res.render(view, {
    title: page.title || metaTags.title,
    metaDescription: page.metaDescription || metaTags.metaDescription,
    metaKeywords: page.metaKeywords || metaTags.metaKeywords,
    bodyClass: fallback.bodyClass,
    pageCopy: content,
  });
}

module.exports = {
  // --- VIEW GETTERS ---
  getHome: (req, res) => {
    renderPage(req, res, "index", "/");
  },

  getAbout: (req, res) => {
    renderPage(req, res, "about", "/about");
  },

  getContact: (req, res) => {
    renderPage(req, res, "contact", "/contact");
  },

  getProduct: (req, res) => {
    renderPage(req, res, "product", "/product");
  },

  getImpressum: (req, res) => {
    renderPage(req, res, "impressum", "/impressum", { bodyClass: "legal-view" });
  },

  getDatenschutz: (req, res) => {
    renderPage(req, res, "datenschutz", "/datenschutz", {
      bodyClass: "legal-view",
    });
  },

  getGuideLanding: (req, res) => {
    renderPage(req, res, "landingPage", "/olivenoel-guide", {
      bodyClass: "lp-guide",
    });
  },

  // --- FORM HANDLERS ---
  handleContactForm: async (req, res) => {
    try {
      const { name, email, message } = req.body;
      const page = getPage(req, "/contact");
      const messages = page.content?.messages || {};
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: messages.required,
        });
      }
      await sendContactMessage(name, email, message);
      res.status(200).json({
        success: true,
        message: messages.success,
      });
    } catch (error) {
      console.error("Errore nel Contact Controller:", error);
      res
        .status(500)
        .json({ success: false, message: "Errore interno al server." });
    }
  },

  // --- NEWSLETTER & LEAD CAPTURE (Prisma Refactored) ---
  postSubscribe: async (req, res) => {
    try {
      const { email, consent, source } = req.body;
      let errorView = "index";
      let route = "/";

      // Mappatura Source degli Hooks (Come da strategia 17/02)
      if (source === "landing_page_guide") {
        errorView = "landingPage";
        route = "/olivenoel-guide";
      } else if (source === "product_quality_focus") {
        errorView = "product";
        route = "/product";
      }
      const page = getPage(req, route);
      const pageCopy = page.content || {};
      const thanksPage = getPage(req, "/thanks");
      const messages =
        pageCopy.messages || thanksPage.content?.messages || {};

      const fileName = "Giuseppe_Mancini_AI_Solution_Architect_2026.pdf";
      const pdfPath = path.join(__dirname, "../public/download/", fileName);
      const downloadLink = `/download/${fileName}`;

      if (!consent)
        return res.status(400).render(errorView, {
          title: page.title,
          pageCopy,
          error: messages.consentRequired,
        });
      if (!email)
        return res
          .status(400)
          .render(errorView, {
            title: page.title,
            pageCopy,
            error: messages.invalidEmail,
          });

      const normalizedEmail = email.toLowerCase().trim();

      // PostgreSQL Upsert: Crea o aggiorna il lead in un'unica transazione
      await prisma.lead.upsert({
        where: { email: normalizedEmail },
        update: { source: source || "guide_re-request" },
        create: {
          email: normalizedEmail,
          consent: true,
          source: source || "guide_request",
          status: "CONFIRMED",
        },
      });

      await sendWelcomePDF(normalizedEmail, pdfPath);

      const thanksCopy = thanksPage.content || {};

      res.render("thanks", {
        title: thanksPage.title,
        currentRoute: route,
        message: thanksCopy.mainMessage,
        downloadUrl: downloadLink,
        pageCopy: thanksCopy,
      });
    } catch (err) {
      console.error("❌ Errore Prisma postSubscribe:", err);
      res.status(500).redirect("/");
    }
  },

  // --- BLOG ENGINE ---
  getBlog: async (req, res) => {
    try {
      const POSTS_PER_PAGE = 6;
      let currentPage = parseInt(req.query.page) || 1;
      const skip = (currentPage - 1) * POSTS_PER_PAGE;

      // Eseguiamo query parallele per massimizzare le performance di Postgres
      const [totalArticles, articles] = await Promise.all([
        prisma.article.count({ where: { status: "PUBLISHED" } }),
        prisma.article.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          skip: skip,
          take: POSTS_PER_PAGE,
          include: {
            author: {
              select: { username: true, firstName: true },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalArticles / POSTS_PER_PAGE);
      const page = getPage(req, "/blog");

      res.render("blog", {
        title: page.title,
        articles,
        pagination: {
          currentPage,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
          nextPage: currentPage + 1,
          prevPage: currentPage - 1,
        },
        originalUrl: req.originalUrl,
        pageCopy: page.content || {},
      });
    } catch (err) {
      console.error("Error loading blog:", err);
      const page = getPage(req, "/blog");
      res.status(500).render("blog", {
        title: page.title,
        articles: [],
        pagination: { currentPage: 1, totalPages: 0 },
        pageCopy: page.content || {},
      });
    }
  },

  // --- STRIPE CHECKOUT ---
  createCheckoutSession: async (req, res) => {
    try {
      const { items } = req.body;
      const stripeInstance = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const productPage = getPage(req, "/product");
      const productCopy = productPage.content || {};
      const product = productCopy.product || {};
      const bundles = productCopy.bundles || [];

      const line_items = items.map((item) => {
        const storeItem = PRODUCTS[item.id];
        if (!storeItem) throw new Error(`Prodotto non valido: ${item.id}`);
        const bundle = bundles[storeItem.bundleIndex];
        if (!product.title || !bundle?.name) {
          throw new Error("Localized product data is incomplete");
        }
        return {
          price_data: {
            currency: "eur",
            product_data: { name: `${product.title} - ${bundle.name}` },
            unit_amount: storeItem.amount,
          },
          quantity: item.quantity,
        };
      });

      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/product`,
        shipping_address_collection: {
          allowed_countries: ["DE", "IT", "AT", "CH"],
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSuccess: async (req, res) => {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.redirect("/");

    try {
      const stripeInstance = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const session =
        await stripeInstance.checkout.sessions.retrieve(sessionId);

      const page = getPage(req, "/success");

      res.render("success", {
        title: page.title,
        customerName: session.customer_details.name,
        totalAmount: session.amount_total / 100,
        orderId: session.id.slice(-10).toUpperCase(),
        customerEmail: session.customer_details.email,
        pageCopy: page.content || {},
      });
    } catch (error) {
      res.redirect("/");
    }
  },
};
