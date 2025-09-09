const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

// Settings file path
const settingsPath = path.join(__dirname, "../../config/settings.json");

// Default settings
const defaultSettings = {
  site: {
    title: "PromontolioBlog",
    description: "Professional blog about olive oil and Gargano region",
    keywords: "olive oil, Gargano, Promontolio, extra virgin",
    contactEmail: "info@promontolioblog.com",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
    },
  },
  content: {
    defaultPostStatus: "draft",
    postsPerPage: 10,
    commentsEnabled: true,
    moderateComments: true,
    allowGuestComments: false,
  },
  uploads: {
    maxFileSize: 5, // MB
    allowedImageTypes: ["jpg", "jpeg", "png", "webp"],
    allowedDocTypes: ["pdf", "doc", "docx"],
  },
  security: {
    sessionTimeout: 24, // hours
    passwordMinLength: 6,
    requireStrongPasswords: false,
    maxLoginAttempts: 5,
  },
};

// Load settings from file
async function loadSettings() {
  try {
    const data = await fs.readFile(settingsPath, "utf8");
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch (error) {
    // If file doesn't exist, return default settings
    return defaultSettings;
  }
}

// Save settings to file
async function saveSettings(settings) {
  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
}

// Show settings form (Admin only)
router.get("/", async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && req.user.role !== "super") {
      req.flash("error", "Access denied. Admin privileges required.");
      return res.redirect("/admin/dashboard");
    }

    const settings = await loadSettings();
    res.render("admin/settings", {
      user: req.user,
      settings,
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    req.flash("error", "Error loading settings");
    res.redirect("/admin/dashboard");
  }
});

// Update settings (Admin only)
router.post("/", async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && req.user.role !== "super") {
      req.flash("error", "Access denied. Admin privileges required.");
      return res.redirect("/admin/dashboard");
    }

    const {
      siteTitle,
      siteDescription,
      siteKeywords,
      contactEmail,
      facebook,
      instagram,
      twitter,
      youtube,
      defaultPostStatus,
      postsPerPage,
      commentsEnabled,
      moderateComments,
      allowGuestComments,
      maxFileSize,
      allowedImageTypes,
      allowedDocTypes,
      sessionTimeout,
      passwordMinLength,
      requireStrongPasswords,
      maxLoginAttempts,
    } = req.body;

    const settings = {
      site: {
        title: siteTitle,
        description: siteDescription,
        keywords: siteKeywords,
        contactEmail,
        socialMedia: {
          facebook,
          instagram,
          twitter,
          youtube,
        },
      },
      content: {
        defaultPostStatus,
        postsPerPage: parseInt(postsPerPage) || 10,
        commentsEnabled: commentsEnabled === "on",
        moderateComments: moderateComments === "on",
        allowGuestComments: allowGuestComments === "on",
      },
      uploads: {
        maxFileSize: parseInt(maxFileSize) || 5,
        allowedImageTypes: allowedImageTypes
          ? allowedImageTypes.split(",").map((t) => t.trim())
          : ["jpg", "jpeg", "png", "webp"],
        allowedDocTypes: allowedDocTypes
          ? allowedDocTypes.split(",").map((t) => t.trim())
          : ["pdf", "doc", "docx"],
      },
      security: {
        sessionTimeout: parseInt(sessionTimeout) || 24,
        passwordMinLength: parseInt(passwordMinLength) || 6,
        requireStrongPasswords: requireStrongPasswords === "on",
        maxLoginAttempts: parseInt(maxLoginAttempts) || 5,
      },
    };

    const saved = await saveSettings(settings);
    if (saved) {
      req.flash("success", "Settings updated successfully");
    } else {
      req.flash("error", "Error saving settings");
    }

    res.redirect("/admin/settings");
  } catch (error) {
    console.error("Error updating settings:", error);
    req.flash("error", "Error updating settings");
    res.redirect("/admin/settings");
  }
});

module.exports = router;
