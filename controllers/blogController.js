const prisma = require("../db");
const slugify = require("slugify");
const { getPageByRoute } = require("../config/i18n");

/* ── PUBLIC HANDLERS ────────────────────────────────────────────────── */

// Lista articoli pubblici (Solo quelli pubblicati)
exports.list = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });
    const page = getPageByRoute(res.locals.locale || "de", "/blog");
    res.render("blog", {
      title: page && page.title ? page.title : "Blog - Promontolio",
      articles,
      pageCopy: (page && page.content) || {},
    });
  } catch (err) {
    console.error("Error loading blog list:", err);
    const page = getPageByRoute(res.locals.locale || "de", "/blog");
    res.render("blog", {
      title: page && page.title ? page.title : "Blog",
      articles: [],
      error: "Errore nel caricamento.",
      pageCopy: (page && page.content) || {},
    });
  }
};

// Visualizza singolo articolo per slug
exports.view = async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });

    if (!article) return res.status(404).render("404");

    // Incremento visite (Atomico in Prisma)
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    const page = getPageByRoute(res.locals.locale || "de", "/blog/:slug");
    res.render("blogSingleArticle", {
      title: article.title,
      article,
      pageCopy: (page && page.content) || {},
    });
  } catch (err) {
    res.status(500).render("404");
  }
};

/* ── ADMIN HANDLERS ─────────────────────────────────────────────────── */

// Gestione articoli nel pannello Admin
exports.adminList = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true, firstName: true, lastName: true } },
      },
    });
    res.render("admin/blogList", { title: "Gestione Blog", articles });
  } catch (err) {
    res.redirect("/admin/dashboard");
  }
};

// Creazione Articolo
exports.create = async (req, res) => {
  try {
    const { title, content, excerpt, category, action } = req.body;
    const finalStatus = action === "publish" ? "PUBLISHED" : "DRAFT";

    const article = await prisma.article.create({
      data: {
        title,
        slug: slugify(title, { lower: true, strict: true }),
        content,
        excerpt,
        status: finalStatus,
        category: category.replace(/-/g, "_").toUpperCase(),
        authorId: req.user.id,
        featuredImage: req.file ? `/image/${req.file.filename}` : null,
      },
    });

    req.flash("success", "Articolo creato con successo!");
    res.redirect("/admin/blog");
  } catch (err) {
    console.error(err);
    res.render("admin/blogForm", {
      title: "Nuovo Articolo",
      error: "Errore salvataggio.",
    });
  }
};

// Update Articolo
exports.update = async (req, res) => {
  try {
    const { title, content, excerpt, category, action } = req.body;
    const articleId = parseInt(req.params.id);

    // Recuperiamo l'articolo per gestire l'immagine esistente
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existing) {
      req.flash("error", "Articolo non trovato.");
      return res.redirect("/admin/blog");
    }

    await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        slug: slugify(title, { lower: true, strict: true }),
        content,
        excerpt,
        category: category.replace(/-/g, "_").toUpperCase(),
        status: action === "publish" ? "PUBLISHED" : "DRAFT",
        featuredImage: req.file
          ? `/image/${req.file.filename}`
          : existing.featuredImage,
      },
    });

    req.flash("success", "Articolo aggiornato.");
    res.redirect("/admin/blog");
  } catch (err) {
    res.redirect("/admin/blog");
  }
};

// Eliminazione
exports.remove = async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: parseInt(req.params.id) } });
    res.redirect("/admin/blog");
  } catch (err) {
    res.redirect("/admin/blog");
  }
};

// Form Helpers
exports.newForm = (req, res) =>
  res.render("admin/blogForm", { article: {}, title: "Nuovo Articolo" });
exports.editForm = async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!article) {
      req.flash("error", "Articolo non trovato.");
      return res.redirect("/admin/blog");
    }
    res.render("admin/blogForm", { article, title: "Modifica Articolo" });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.redirect("/admin/blog");
  }
};
