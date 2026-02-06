// Controller for public routes
const Article = require("../models/Article");
const Lead = require("../models/Lead");
const path = require("path");
const { sendWelcomePDF } = require("../services/mailService");

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
    res.render("guide-landing", {
      title: "Kostenloser Ratgeber: Olivenöl-Qualität erkennen | Promontolio",
      metaDescription:
        "Entdecken Sie die Geheimnisse des apulischen Olivenöls mit unserem gratis Leitfaden. Lernen Sie, wie Sie erstklassige Qualität von Massenware unterscheiden.",
      bodyClass: "lp-guide", // Utile per CSS specifici
    });
  },

  postSubscribe: async (req, res) => {
    try {
      const { email, consent } = req.body;

      // Unifichiamo il percorso del file per evitare errori di battitura
      const fileName = "Giuseppe_Mancini_AI_Architect.pdf";
      const pdfPath = path.join(__dirname, "../public/download/", fileName);
      const downloadLink = `/download/${fileName}`;

      // 1. Verifica Consenso
      if (!consent) {
        return res.status(400).render("about", {
          error: "Zustimmung erforderlich, um den Guide zu erhalten.",
          bodyClass: "home-page",
        });
      }

      // 2. Validazione Email
      if (!email) {
        return res.status(400).render("about", {
          error: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
          bodyClass: "home-page",
        });
      }

      // 3. Verifica Lead Esistente
      const existingLead = await Lead.findOne({ email });
      if (existingLead) {
        // INVIO EMAIL anche all'utente esistente
        await sendWelcomePDF(email, pdfPath);

        return res.render("thanks", {
          title: "Willkommen zurück!",
          message:
            "Sie sind bereits registriert. Wir haben Ihnen den Guide erneut an Ihre E-Mail gesendet.",
          downloadUrl: downloadLink,
        });
      }

      // 4. Salvataggio Nuovo Lead
      const newLead = new Lead({
        email,
        consent: consent === "on" || consent === true,
        source: "Landing_Page_Guide",
      });
      await newLead.save();

      // 5. INVIO EMAIL EFFETTIVO (Fondamentale!)
      await sendWelcomePDF(email, pdfPath);

      // 6. Render della vista Thanks
      res.render("thanks", {
        title: "Vielen Dank!",
        message:
          "Ihr Bio-Olivenöl Guide ist fast fertig. Bitte prüfen Sie Ihr Postfach.",
        downloadUrl: downloadLink,
      });
    } catch (err) {
      console.error("Errore iscrizione/invio:", err);
      res.status(500).redirect("/");
    }
  },

  getBlog: async (req, res) => {
    try {
      // Pagination configuration
      const POSTS_PER_PAGE = 6; // 6 posts per page for nice grid layout

      // Get page number - check both query and manual setting
      let currentPage = 1;

      if (req.query.page) {
        currentPage = parseInt(req.query.page);
      } else if (req.params && req.params.page) {
        currentPage = parseInt(req.params.page);
      } else if (req.url && req.url.includes("/page/")) {
        // Extract page from URL as fallback
        const urlParts = req.url.split("/");
        const pageIndex = urlParts.indexOf("page");
        if (pageIndex !== -1 && urlParts[pageIndex + 1]) {
          currentPage = parseInt(urlParts[pageIndex + 1]);
        }
      }

      if (isNaN(currentPage) || currentPage < 1) {
        currentPage = 1;
      }

      const skip = (currentPage - 1) * POSTS_PER_PAGE;

      // Check database connection
      if (
        !require("mongoose").connection.readyState ||
        require("mongoose").connection.readyState !== 1
      ) {
        return res.render("blog", {
          title: "Blog & Rezepte | Promontolio",
          metaDescription:
            "Erfahren Sie mehr über Olivenöl-Kultur, Ernteprozesse und authentische Rezepte aus Apulien in unserem Blog.",
          metaKeywords:
            "Olivenöl Blog, Rezepte, Apulien Wissen, Promontolio Magazin",
          articles: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          error:
            "Verbindung zum Server unterbrochen. Bitte versuchen Sie es später erneut.",
        });
      }

      // Get total count of published articles only
      const totalArticles = await Article.countDocuments({
        status: "published",
      });
      const totalPages = Math.ceil(totalArticles / POSTS_PER_PAGE);

      // Get published articles for current page
      const articles = await Article.find({ status: "published" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(POSTS_PER_PAGE)
        .populate("author", "username");

      // Calculate pagination info
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
      console.error("Error loading blog with pagination:", err);
      res.status(500).render("blog", {
        title: "Blog & Rezepte | Promontolio",
        metaDescription:
          "Entdecken Sie Wissenswertes über apulisches Olivenöl, Ernteprozesse und Rezepte in unserem Magazin.",
        metaKeywords: "Olivenöl Blog, Rezepte, Apulien Tipps, Promontolio",
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error:
          "Entschuldigung, beim Laden der Artikel ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        originalUrl: req.originalUrl,
      });
    }
  },
};
