// controllers/publicController.js
const prisma = require("../db"); // Il nostro client centralizzato
const path = require("path");
const {
  sendWelcomePDF,
  sendContactMessage,
} = require("../services/emailService");

// Configurazione Prodotti (Single Source of Truth)
const PRODUCTS = {
  "oil-bundle-6": {
    name: "Bio-Olivenöl Extra Vergine (6er Paket)",
    amount: 9600, // In centesimi (96,00 €)
  },
  "oil-bundle-12": {
    name: "Bio-Olivenöl Extra Vergine (12er Paket)",
    amount: 19200, // In centesimi (192,00 €)
  },
};

module.exports = {
  // --- VIEW GETTERS ---
  getHome: (req, res) => {
    res.render("index", {
      title: "Promontolio | Premium Bio-Olivenöl aus Apulien",
      metaDescription:
        "Willkommen bei Promontolio. Wir selektieren für Sie das beste zertifizierte Bio-Olivenöl aus Apulien. Höchste Qualität direkt in Frankfurt am Main.",
      metaKeywords:
        "Olivenöl, Bio, Apulien, Gargano, Premium Olivenöl, Frankfurt, Feinkost",
    });
  },

  getAbout: (req, res) => {
    res.render("about", {
      title: "Über uns | Die Kunst der Olivenöl-Selektion",
      metaDescription:
        "Erfahren Sie mehr über Promontolio: Als zertifizierte Experten selektieren wir nur die außergewöhnlichsten Olivenöle Apuliens nach strengsten Kriterien.",
    });
  },

  getContact: (req, res) => {
    res.render("contact", {
      title: "Kontakt | Ihre Fragen an den Experten",
      metaDescription:
        "Haben Sie Fragen zu unserer Selektion oder den aktuellen Erntepartien? Kontaktieren Sie Promontolio.",
    });
  },

  getProduct: (req, res) => {
    res.render("product", {
      title: "Unsere Selektion | Exklusives Bio-Olivenöl",
      metaDescription:
        "Entdecken Sie unsere streng limitierten Erntepartien. Zertifiziertes, reines Bio-Olivenöl direttamente dal Gargano.",
    });
  },

  getImpressum: (req, res) => {
    res.render("impressum", {
      title: "Impressum | Promontolio",
      bodyClass: "legal-view",
    });
  },

  getDatenschutz: (req, res) => {
    res.render("datenschutz", {
      title: "Datenschutzerklärung | Promontolio",
      bodyClass: "legal-view",
    });
  },

  getGuideLanding: (req, res) => {
    res.render("landingPage", {
      title: "Kostenloser Ratgeber: Olivenöl-Qualität erkennen | Promontolio",
      metaDescription:
        "Entdecken Sie die Geheimnisse del Gargano con la nostra guida gratuita.",
      bodyClass: "lp-guide",
    });
  },

  // --- FORM HANDLERS ---
  handleContactForm: async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "Per favore, compila tutti i campi obbligatori.",
        });
      }
      await sendContactMessage(name, email, message);
      res.status(200).json({
        success: true,
        message: "Grazie! Abbiamo ricevuto il tuo messaggio.",
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
      let errorView = "index",
        pageTitle = "Bio-Olivenöl aus Apulien",
        route = "/";

      // Mappatura Source degli Hooks (Come da strategia 17/02)
      if (source === "landing_page_guide") {
        errorView = "landingPage";
        pageTitle = "Exklusiver Olivenöl Guide";
        route = "/olivenoel-guide";
      } else if (source === "product_quality_focus") {
        errorView = "product";
        pageTitle = "Unsere Selektion";
        route = "/product";
      }

      const fileName = "Guida_Olio_Gargano_Promontolio.pdf";
      const pdfPath = path.join(__dirname, "../public/download/", fileName);
      const downloadLink = `/download/${fileName}`;

      if (!consent)
        return res.status(400).render(errorView, {
          title: pageTitle,
          error: "Zustimmung erforderlich.",
        });
      if (!email)
        return res
          .status(400)
          .render(errorView, { title: pageTitle, error: "E-Mail ungültig." });

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

      res.render("thanks", {
        title: "Vielen Dank",
        currentRoute: route,
        message:
          "Ihr Guide ist auf dem Weg! Sie können ihn auch direkt hier herunterladen.",
        downloadUrl: downloadLink,
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

      res.render("blog", {
        title: "Blog & Rezepte | Promontolio",
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
      });
    } catch (err) {
      console.error("Error loading blog:", err);
      res.status(500).render("blog", {
        title: "Blog",
        articles: [],
        pagination: { currentPage: 1, totalPages: 0 },
      });
    }
  },

  // --- STRIPE CHECKOUT ---
  createCheckoutSession: async (req, res) => {
    try {
      const { items } = req.body;
      const stripeInstance = require("stripe")(process.env.STRIPE_SECRET_KEY);

      const line_items = items.map((item) => {
        const storeItem = PRODUCTS[item.id];
        if (!storeItem) throw new Error(`Prodotto non valido: ${item.id}`);
        return {
          price_data: {
            currency: "eur",
            product_data: { name: storeItem.name },
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

      res.render("success", {
        title: "Vielen Dank",
        customerName: session.customer_details.name,
        totalAmount: session.amount_total / 100,
        orderId: session.id.slice(-10).toUpperCase(),
        customerEmail: session.customer_details.email,
      });
    } catch (error) {
      res.redirect("/");
    }
  },
};
