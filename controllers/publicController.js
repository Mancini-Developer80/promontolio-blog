// Controller for public routes
const Article = require("../models/Article");
const Lead = require("../models/Lead");
const path = require("path");
const {
  sendWelcomePDF,
  sendContactMessage,
} = require("../services/emailService");
const stripe = require("stripe");

// Configurazione Prodotti (Single Source of Truth)
const PRODUCTS = {
  "oil-bundle-6": {
    name: "Bio-Olivenöl Extra Vergine (6er Paket)",
    amount: 9600, // Prezzo in centesimi (96,00 €)
  },
  "oil-bundle-12": {
    name: "Bio-Olivenöl Extra Vergine (12er Paket)",
    amount: 19200, // Prezzo in centesimi (192,00 €)
  },
};

module.exports = {
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
      metaKeywords:
        "Über uns, Olivenöl Experte, Selektion, Apulien, Bio-Qualität, Promontolio Expertise",
    });
  },

  getContact: (req, res) => {
    res.render("contact", {
      title: "Kontakt | Ihre Fragen an den Experten",
      metaDescription:
        "Haben Sie Fragen zu unserer Selektion oden den aktuellen Erntepartien? Kontaktieren Sie Promontolio für eine persönliche Beratung.",
      metaKeywords:
        "Kontakt, Olivenöl Beratung, Kundenservice, Promontolio Frankfurt, Fragen",
    });
  },

  getProduct: (req, res) => {
    res.render("product", {
      title: "Unsere Selektion | Exklusives Bio-Olivenöl",
      metaDescription:
        "Entdecken Sie unsere streng limitierten Erntepartien. Zertifiziertes, reines Bio-Olivenöl direkt aus den besten Hainen Apuliens.",
      metaKeywords:
        "Olivenöl kaufen, Bio-Olivenöl, Selektion, Premium Produkte, Apulien Spezialitäten",
    });
  },

  getImpressum: (req, res) => {
    res.render("impressum", {
      title: "Impressum | Promontolio",
      bodyClass: "legal-view",
      metaDescription:
        "Rechtliche Informationen und Anbieterkennzeichnung von Promontolio.",
      metaKeywords: "Impressum, Frankfurt, Olivenöl",
    });
  },

  getDatenschutz: (req, res) => {
    res.render("datenschutz", {
      title: "Datenschutzerklärung | Promontolio",
      bodyClass: "legal-view",
      metaDescription:
        "Informationen zum Datenschutz und zur DSGVO-Konformität.",
      metaKeywords: "Datenschutz, DSGVO, Privatsphäre",
    });
  },

  getGuideLanding: (req, res) => {
    res.render("landingPage", {
      title: "Kostenloser Ratgeber: Olivenöl-Qualität erkennen | Promontolio",
      metaDescription:
        "Entdecken Sie die Geheimnisse des apulischen Olivenöls mit unserem gratis Leitfaden. Lernen Sie, wie Sie erstklassige Qualität von Massenware unterscheiden.",
      bodyClass: "lp-guide",
    });
  },

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
        message:
          "Grazie! Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.",
      });
    } catch (error) {
      console.error("Errore nel Contact Controller:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno al server. Riprova più tardi.",
      });
    }
  },

  // --- LOGICA STRIPE ---
  createCheckoutSession: async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Carrello vuoto" });
      }

      const stripeLib = require("stripe");
      const stripeInstance = stripeLib(process.env.STRIPE_SECRET_KEY);

      const line_items = items.map((item) => {
        const storeItem = PRODUCTS[item.id];
        if (!storeItem) throw new Error(`Prodotto non valido: ${item.id}`);

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: storeItem.name,
              images: [`${process.env.APP_URL}/image/BottigliaBio.png`],
            },
            unit_amount: storeItem.amount,
          },
          quantity: item.quantity,
        };
      });

      const session = await stripeInstance.checkout.sessions.create({
        // Usiamo solo "card" per ora, che è il metodo universale e non fallisce mai
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        locale: "auto",
        shipping_address_collection: {
          allowed_countries: ["DE", "IT", "AT", "CH"],
        },
        phone_number_collection: { enabled: true },
        success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/product`,
        tax_id_collection: { enabled: true },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe Error:", error.message);
      res.status(500).json({
        error: "Errore durante la creazione della sessione",
        details: error.message,
      });
    }
  },

  getSuccess: async (req, res) => {
    try {
      const sessionId = req.query.session_id;

      // Se non c'è un ID sessione, l'utente è arrivato qui per errore
      if (!sessionId) {
        return res.redirect("/");
      }

      const stripeLib = require("stripe");
      const stripeInstance = stripeLib(process.env.STRIPE_SECRET_KEY);

      // Recuperiamo i dati della sessione dal server di Stripe
      const session =
        await stripeInstance.checkout.sessions.retrieve(sessionId);

      // Prepariamo i dati per il template EJS
      res.render("success", {
        title: "Vielen Dank | Promontolio",
        metaDescription: "Vielen Dank für Ihre Bestellung bei Promontolio.",
        bodyClass: "success-page",
        customerName: session.customer_details.name, // Nome di chi ha pagato
        totalAmount: session.amount_total / 100, // Da centesimi a Euro
        orderId: session.id.slice(-10).toUpperCase(), // Ultime 10 cifre come numero ordine
        customerEmail: session.customer_details.email,
      });
    } catch (error) {
      console.error("Errore recupero sessione Stripe:", error);
      // Passiamo valori di cortesia per evitare che la pagina si rompa
      res.render("success", {
        title: "Vielen Dank | Promontolio",
        metaDescription: "Vielen Dank für Ihre Bestellung bei Promontolio.",
        bodyClass: "success-page",
        customerName: "unser Kunde", // "nostro cliente" in tedesco
        totalAmount: "---",
        orderId: "---",
        customerEmail: "Ihre E-Mail-Adresse",
      });
    }
  },

  // --- NEWSLETTER & GUIDE ---
  postSubscribe: async (req, res) => {
    try {
      const { email, consent, source } = req.body;
      let errorView = "index";
      let pageTitle = "Bio-Olivenöl aus Apulien";
      let route = "/";

      if (source === "landing_page_guide") {
        errorView = "landingPage";
        pageTitle = "Exklusiver Olivenöl Guide";
        route = "/olivenoel-guide";
      } else if (source === "about_page_immersive") {
        errorView = "about";
        pageTitle = "Über uns";
        route = "/about";
      }

      const fileName = "Giuseppe_Mancini_AI_Solution_Architect_2026.pdf";
      const pdfPath = path.join(__dirname, "../public/download/", fileName);
      const downloadLink = `/download/${fileName}`;

      const renderError = (msg) => {
        return res.status(400).render(errorView, {
          title: pageTitle,
          currentRoute: route,
          error: msg,
          bodyClass: errorView === "landingPage" ? "lp-body" : "home-page",
          metaDescription:
            "Laden Sie den kostenlosen Promontolio Guide herunter.",
        });
      };

      if (!consent) return renderError("Zustimmung erforderlich.");
      if (!email)
        return renderError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");

      let lead = await Lead.findOne({ email });
      if (lead) {
        lead.source = source || lead.source;
        await lead.save();
        await sendWelcomePDF(email, pdfPath);
        return res.render("thanks", {
          title: "Willkommen zurück",
          currentRoute: route,
          message:
            "Sie sind bereits registriert. Wir haben Ihnen den Guide erneut per E-Mail gesendet.",
          downloadUrl: downloadLink,
        });
      }

      const newLead = new Lead({
        email,
        consent: true,
        source: source || "guide_request",
      });
      await newLead.save();
      await sendWelcomePDF(email, pdfPath);

      res.render("thanks", {
        title: "Vielen Dank",
        currentRoute: route,
        message:
          "Ihr Guide ist auf dem Weg! Sie können ihn auch direkt hier herunterladen.",
        downloadUrl: downloadLink,
      });
    } catch (err) {
      console.error("❌ Errore critico postSubscribe:", err);
      res.status(500).redirect("/");
    }
  },

  getBlog: async (req, res) => {
    try {
      const POSTS_PER_PAGE = 6;
      let currentPage =
        parseInt(req.query.page) || parseInt(req.params.page) || 1;
      if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

      const skip = (currentPage - 1) * POSTS_PER_PAGE;

      const totalArticles = await Article.countDocuments({
        status: "published",
      });
      const totalPages = Math.ceil(totalArticles / POSTS_PER_PAGE);

      const articles = await Article.find({ status: "published" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(POSTS_PER_PAGE)
        .populate("author", "username");

      const pagination = {
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        nextPage: currentPage + 1,
        prevPage: currentPage - 1,
        totalArticles,
      };

      res.render("blog", {
        title:
          currentPage > 1
            ? `Blog - Seite ${currentPage} | Promontolio`
            : "Blog & Rezepte | Promontolio",
        metaDescription:
          "Tauchen Sie ein in die Welt des apulischen Olivenöls: Fachwissen, Ernteberichte und exklusive Rezepte direkt vom Experten.",
        metaKeywords:
          "Olivenöl Blog, Rezepte Apulien, Olivenöl Wissen, Feinkost Magazin",
        articles,
        pagination,
        originalUrl: req.originalUrl,
      });
    } catch (err) {
      console.error("Error loading blog:", err);
      res.status(500).render("blog", {
        title: "Blog & Rezepte | Promontolio",
        articles: [],
        pagination: { currentPage: 1, totalPages: 0 },
        error:
          "Entschuldigung, beim Laden der Artikel ist ein Fehler aufgetreten.",
        originalUrl: req.originalUrl,
      });
    }
  },
};
