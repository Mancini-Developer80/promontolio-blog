// controllers/publicController.js
const prisma = require("../db"); // Il nostro client centralizzato
const path = require("path");
const crypto = require("crypto");
const {
  sendWelcomePDF,
  sendLeadConfirmation,
  sendLeadNotification,
  sendContactMessage,
} = require("../services/emailService");
const { getPageByRoute } = require("../config/i18n");

function getContactInput(body = {}) {
  const { name, email, message, consent, website } = body;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    (consent !== true && consent !== "true") ||
    (typeof website !== "undefined" && website !== "")
  ) {
    return null;
  }

  const input = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  };

  if (
    input.name.length < 2 ||
    input.name.length > 100 ||
    input.message.length < 10 ||
    input.message.length > 5000 ||
    input.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
  ) {
    return null;
  }

  return input;
}

const LEAD_SOURCES = {
  landing_page_guide: { view: "landingPage", route: "/olivenoel-guide" },
  about_page_immersive: { view: "about", route: "/about" },
  product_quality_focus: { view: "product", route: "/product" },
};
const GUIDE_FILE_NAME = "Giuseppe_Mancini_AI_Solution_Architect_2026.pdf";
const LEAD_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getLeadInput(body = {}) {
  const { email, consent, source, website } = body;
  if (
    typeof email !== "string" ||
    (consent !== true && consent !== "true") ||
    (typeof website !== "undefined" && website !== "")
  ) {
    return null;
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail.length === 0 ||
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    !LEAD_SOURCES[source]
  ) {
    return null;
  }
  return { email: normalizedEmail, source };
}

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

function getPublicBaseUrl(req) {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
    } catch (error) {
      console.warn("APP_URL non valida; uso l'origine della richiesta.");
    }
  }

  return `${req.protocol}://${req.get("host")}`;
}

function getPage(req, routePath) {
  const locale = req.res && req.res.locals ? req.res.locals.locale : "de";
  return getPageByRoute(locale, routePath) || {};
}

function renderThanks(req, res, status, message, downloadUrl) {
  const thanksPage = getPage(req, "/thanks");
  return res.status(status).render("thanks", {
    title: thanksPage.title,
    currentRoute: "/thanks",
    message,
    downloadUrl,
    pageCopy: thanksPage.content || {},
  });
}

function renderPage(req, res, view, routePath, fallback = {}) {
  const page = getPage(req, routePath);
  const content = page.content || {};
  const metaTags = page.metaTags || {};

  res.render(view, {
    title: page.title || metaTags.title,
    metaDescription: page.metaDescription || metaTags.metaDescription,
    metaKeywords: page.metaKeywords || metaTags.metaKeywords,
    ...fallback,
    pageCopy: content,
  });
}

function respondToContactRequest(req, res, status, response) {
  if (
    typeof req.is !== "function" ||
    req.is("application/json") ||
    req.xhr
  ) {
    return res.status(status).json(response);
  }

  const statusKey = response.success
    ? "success"
    : status >= 500
      ? "error"
      : "invalid";
  return res.redirect(`/contact?contact=${statusKey}`);
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
    renderPage(req, res, "contact", "/contact", {
      contactStatus: req.query?.contact,
    });
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
      const page = getPage(req, "/contact");
      const messages = page.content?.messages || {};
      const body = req.body || {};
      if (!body.name || !body.email || !body.message || !body.consent) {
        const response = {
          success: false,
          message: messages.required,
        };
        return respondToContactRequest(req, res, 400, response);
      }
      const input = getContactInput(body);
      if (!input) {
        const response = {
          success: false,
          message: messages.invalid || messages.required,
        };
        return respondToContactRequest(req, res, 400, response);
      }
      const contactMessage = await prisma.contactMessage.create({
        data: {
          name: input.name,
          email: input.email,
          message: input.message,
        },
      });
      try {
        await sendContactMessage(
          input.name,
          input.email,
          input.message,
          req.res?.locals?.locale,
        );
        await prisma.contactMessage.update({
          where: { id: contactMessage.id },
          data: { status: "SENT", deliveredAt: new Date() },
        });
      } catch (error) {
        await prisma.contactMessage.update({
          where: { id: contactMessage.id },
          data: {
            status: "FAILED",
            deliveryError: String(error.message || error).slice(0, 500),
          },
        });
        throw error;
      }
      const response = {
        success: true,
        message: messages.success,
      };
      return respondToContactRequest(req, res, 200, response);
    } catch (error) {
      console.error("Errore nel Contact Controller:", error);
      return respondToContactRequest(req, res, 500, {
        success: false,
        message: messages.serverError || "Errore interno al server.",
      });
    }
  },

  // --- NEWSLETTER & LEAD CAPTURE ---
  postSubscribe: async (req, res) => {
    let lead;
    try {
      const sourceConfig =
        LEAD_SOURCES[req.body?.source] || { view: "index", route: "/" };
      const page = sourceConfig
        ? getPage(req, sourceConfig.route)
        : getPage(req, "/olivenoel-guide");
      const pageCopy = page.content || {};
      const thanksPage = getPage(req, "/thanks");
      const messages =
        pageCopy.messages || thanksPage.content?.messages || {};

      const input = getLeadInput(req.body);
      if (!input) {
        return res.status(400).render(sourceConfig.view, {
          title: page.title,
          pageCopy,
          error: !req.body?.consent
            ? messages.consentRequired
            : messages.invalidEmail,
        });
      }

      const locale = req.res?.locals?.locale === "it" ? "it" : "de";
      const confirmationToken = createToken();
      const unsubscribeToken = createToken();
      const now = new Date();
      lead = await prisma.lead.upsert({
        where: { email: input.email },
        update: {
          status: "PENDING",
          consent: true,
          consentAt: now,
          locale,
          source: input.source,
          confirmationTokenHash: hashToken(confirmationToken),
          confirmationTokenExpires: new Date(now.getTime() + LEAD_TOKEN_TTL_MS),
          unsubscribeTokenHash: hashToken(unsubscribeToken),
          confirmedAt: null,
          emailLastError: null,
        },
        create: {
          email: input.email,
          status: "PENDING",
          consent: true,
          consentAt: now,
          locale,
          source: input.source,
          confirmationTokenHash: hashToken(confirmationToken),
          confirmationTokenExpires: new Date(now.getTime() + LEAD_TOKEN_TTL_MS),
          unsubscribeTokenHash: hashToken(unsubscribeToken),
        },
      });

      const confirmationUrl = `${getPublicBaseUrl(req)}/subscribe/confirm/${confirmationToken}`;
      await sendLeadConfirmation(input.email, confirmationUrl, locale);
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          lastEmailSentAt: new Date(),
          emailSendAttempts: { increment: 1 },
          emailLastError: null,
        },
      });

      return renderThanks(req, res, 200, messages.confirmationSent);
    } catch (error) {
      console.error("Errore nella richiesta guida:", error);
      if (lead) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            emailSendAttempts: { increment: 1 },
            emailLastError: String(error.message || error).slice(0, 500),
          },
        }).catch((updateError) => {
          console.error("Errore aggiornando lo stato email del lead:", updateError);
        });
      }
      res.status(500).redirect("/olivenoel-guide?subscribe=error");
    }
  },

  confirmSubscription: async (req, res) => {
    try {
      const lead = await prisma.lead.findUnique({
        where: { confirmationTokenHash: hashToken(req.params.token || "") },
      });
      const messages = getPage(req, "/thanks").content?.messages || {};
      if (
        !lead ||
        lead.status === "UNSUBSCRIBED" ||
        !lead.confirmationTokenExpires ||
        lead.confirmationTokenExpires < new Date()
      ) {
        return renderThanks(req, res, 400, messages.confirmationExpired);
      }

      const pdfPath = path.join(__dirname, "../public/download/", GUIDE_FILE_NAME);
      const unsubscribeToken = createToken();
      await sendWelcomePDF(
        lead.email,
        pdfPath,
        lead.locale,
        `${getPublicBaseUrl(req)}/subscribe/unsubscribe/${unsubscribeToken}`,
      );
      const confirmedAt = new Date();
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: "CONFIRMED",
          confirmedAt,
          confirmationTokenHash: null,
          confirmationTokenExpires: null,
          unsubscribeTokenHash: hashToken(unsubscribeToken),
          lastEmailSentAt: confirmedAt,
          emailSendAttempts: { increment: 1 },
          emailLastError: null,
        },
      });
      await sendLeadNotification(lead.email, lead.source, lead.locale).catch((error) => {
        console.error("Errore nella notifica interna del lead:", error);
      });
      return renderThanks(
        req,
        res,
        200,
        messages.confirmed,
        `/download/${GUIDE_FILE_NAME}`,
      );
    } catch (error) {
      console.error("Errore nella conferma della guida:", error);
      return renderThanks(
        req,
        res,
        500,
        getPage(req, "/thanks").content?.messages?.deliveryError,
      );
    }
  },

  unsubscribe: async (req, res) => {
    try {
      const lead = await prisma.lead.findUnique({
        where: { unsubscribeTokenHash: hashToken(req.params.token || "") },
      });
      const messages = getPage(req, "/thanks").content?.messages || {};
      if (!lead) {
        return renderThanks(req, res, 404, messages.unsubscribeInvalid);
      }
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: "UNSUBSCRIBED",
          consent: false,
          confirmationTokenHash: null,
          confirmationTokenExpires: null,
        },
      });
      return renderThanks(req, res, 200, messages.unsubscribed);
    } catch (error) {
      console.error("Errore nella revoca del consenso:", error);
      return renderThanks(
        req,
        res,
        500,
        getPage(req, "/thanks").content?.messages?.deliveryError,
      );
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
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Il carrello è vuoto." });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("STRIPE_SECRET_KEY non configurata.");
        return res
          .status(503)
          .json({ error: "Il pagamento non è configurato." });
      }

      const stripeInstance = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const productPage = getPage(req, "/product");
      const productCopy = productPage.content || {};
      const product = productCopy.product || {};
      const bundles = productCopy.bundles || [];

      const line_items = items.map((item) => {
        const storeItem = PRODUCTS[item.id];
        if (!storeItem) throw new Error(`Prodotto non valido: ${item.id}`);
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error(`Quantità non valida per il prodotto: ${item.id}`);
        }
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
        success_url: `${getPublicBaseUrl(req)}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getPublicBaseUrl(req)}/product`,
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
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY non configurata.");
      }

      const stripeInstance = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const session =
        await stripeInstance.checkout.sessions.retrieve(sessionId);
      const customerDetails = session.customer_details || {};

      if (
        session.payment_status !== "paid" ||
        !Number.isFinite(session.amount_total)
      ) {
        throw new Error("Sessione Stripe non pagata o priva di importo.");
      }

      const page = getPage(req, "/success");

      res.render("success", {
        title: page.title,
        customerName: customerDetails.name || "",
        totalAmount: session.amount_total / 100,
        orderId: session.id.slice(-10).toUpperCase(),
        customerEmail: customerDetails.email || "",
        pageCopy: page.content || {},
      });
    } catch (error) {
      res.redirect("/");
    }
  },
};
