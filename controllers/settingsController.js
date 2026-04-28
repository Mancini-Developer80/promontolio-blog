const prisma = require("../db");

// 1. Definiamo la struttura completa attesa dal template
const defaultSettings = {
  site: {
    title: "Promontolio",
    description: "Olio del Gargano",
    keywords: "",
    socialMedia: { facebook: "", instagram: "", twitter: "", linkedin: "" },
  },
  content: {
    defaultPostStatus: "draft",
    postsPerPage: 10,
    enableComments: false,
  },
  uploads: {
    maxFileSize: 5,
    allowedImageTypes: ["jpg", "jpeg", "png", "webp"],
    allowedDocTypes: ["pdf", "doc", "docx"],
  },
  // AGGIUNTO: Sezione Security per risolvere l'errore alla riga 466
  security: {
    sessionTimeout: 24,
    twoFactorAuth: false,
  },
};

exports.getSettings = async (req, res) => {
  try {
    const record = await prisma.setting.findUnique({
      where: { key: "site_config" },
    });

    const dbValues = record && record.value ? record.value : {};

    // Costruiamo l'oggetto finale con tutti i rami necessari
    const settings = {
      site: {
        ...defaultSettings.site,
        ...(dbValues.site || {}),
        socialMedia: {
          ...defaultSettings.site.socialMedia,
          ...(dbValues.site?.socialMedia || {}),
        },
      },
      content: { ...defaultSettings.content, ...(dbValues.content || {}) },
      uploads: { ...defaultSettings.uploads, ...(dbValues.uploads || {}) },
      security: { ...defaultSettings.security, ...(dbValues.security || {}) }, // FIX RIGA 466
    };

    // Garanzia tipi Array per evitare crash .join()
    if (!Array.isArray(settings.uploads.allowedImageTypes)) {
      settings.uploads.allowedImageTypes =
        defaultSettings.uploads.allowedImageTypes;
    }
    if (!Array.isArray(settings.uploads.allowedDocTypes)) {
      settings.uploads.allowedDocTypes =
        defaultSettings.uploads.allowedDocTypes;
    }

    res.render("admin/settings", {
      user: req.user,
      settings: settings,
      currentRoute: "/admin/settings",
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    res.redirect("/admin/dashboard");
  }
};

exports.updateSettings = async (req, res) => {
  try {
    // Organizziamo i dati provenienti dal form per matchare la struttura JSON
    const updatedValue = {
      site: {
        title: req.body.siteTitle,
        description: req.body.siteDescription,
        keywords: req.body.siteKeywords,
        socialMedia: {
          facebook: req.body.facebook,
          instagram: req.body.instagram,
          twitter: req.body.twitter,
          linkedin: req.body.linkedin,
        },
      },
      content: {
        defaultPostStatus: req.body.defaultPostStatus,
        postsPerPage: parseInt(req.body.postsPerPage) || 10,
        enableComments: req.body.enableComments === "on",
      },
      uploads: {
        maxFileSize: parseInt(req.body.maxFileSize) || 5,
        // Convertiamo la stringa separata da virgole in un Array per il DB
        allowedImageTypes: req.body.allowedImageTypes
          .split(",")
          .map((s) => s.trim()),
        allowedDocTypes: req.body.allowedDocTypes
          .split(",")
          .map((s) => s.trim()),
      },
      security: {
        sessionTimeout:
          parseInt(req.body.sessionTimeout) ||
          defaultSettings.security.sessionTimeout,
        twoFactorAuth: req.body.twoFactorAuth === "on",
      },
    };

    await prisma.setting.upsert({
      where: { key: "site_config" },
      update: { value: updatedValue },
      create: { key: "site_config", value: updatedValue },
    });

    req.flash("success", "Impostazioni salvate con successo!");
    res.redirect("/admin/settings");
  } catch (error) {
    console.error("Save settings error:", error);
    req.flash("error", "Errore durante il salvataggio.");
    res.redirect("/admin/settings");
  }
};
