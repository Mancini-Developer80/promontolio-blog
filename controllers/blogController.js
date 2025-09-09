// controllers/blogController.js
const Article = require("../models/Article");
const slugify = require("slugify");

/* ── PUBLIC HANDLER// Show "Edit Article" form (GET /admin/blog/:id/edit)
exports.editForm = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.redirect("/admin/blog");
    res.render("admin/blogForm", {
      title: "Edit Article",
      user: req.user,
      article,───────────────────────────────────────────── */

// List all blog posts (GET /blog)
exports.list = async (req, res) => {
  try {
    // Check if mongoose is connected
    if (
      !require("mongoose").connection.readyState ||
      require("mongoose").connection.readyState !== 1
    ) {
      // Not connected: render empty blog immediately
      return res.render("blog", {
        title: "Blog",
        articles: [],
        error: "Database not connected.",
      });
    }
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .populate("author", "username");
    res.render("blog", { title: "Blog", articles });
  } catch (err) {
    console.error("Error loading blog list:", err);
    res.status(500).render("blog", {
      title: "Blog",
      articles: [],
      error: "Unable to load articles.",
    });
  }
};

// View a single blog post by slug (GET /blog/:slug)
exports.view = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate(
      "author",
      "username"
    );

    if (!article) {
      return res.status(404).render("404", { title: "Post Not Found" });
    }

    article.viewCount++;
    await article.save();

    res.render("blogSingleArticle", { title: article.title, article });
  } catch (err) {
    console.error("Error loading blog post:", err);
    res.status(500).render("404", { title: "Error" });
  }
};

/* ── ADMIN HANDLERS ─────────────────────────────────────────────────── */

// List articles in admin panel (GET /admin/blog)
exports.adminList = async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .populate("author", "username");
    res.render("admin/blogList", {
      title: "Manage Articles",
      user: req.user,
      articles,
    });
  } catch (err) {
    console.error("Admin list error:", err);
    res.status(500).render("admin/blogList", {
      title: "Manage Articles",
      user: req.user || { username: "Unknown", role: "user" },
      articles: [],
      error: "Unable to load articles.",
    });
  }
};

// Show “New Article” form (GET /admin/blog/new)
exports.newForm = (req, res) => {
  res.render("admin/blogForm", {
    title: "Create New Article",
    user: req.user,
    article: {}, // empty for the form
  });
};

// Create article (POST /admin/blog/new)
exports.create = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      status,
      category,
      metaDescription,
      keywords,
      action,
    } = req.body;

    // Determine final status based on action
    const finalStatus = action === "publish" ? "published" : "draft";

    const articleData = {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      content,
      excerpt,
      status: finalStatus,
      category,
      metaDescription,
      keywords,
      author: req.user._id,
    };

    // Handle file upload if present
    if (req.file) {
      articleData.featuredImage = `/image/${req.file.filename}`;
    }

    const article = new Article(articleData);
    await article.save();

    req.flash(
      "success",
      `Article ${
        finalStatus === "published" ? "published" : "saved as draft"
      } successfully!`
    );
    res.redirect("/admin/blog");
  } catch (err) {
    console.error("Create article error:", err);
    res.render("admin/blogForm", {
      title: "Create New Article",
      user: req.user,
      article: req.body,
      error: "Failed to create article. Please try again.",
    });
  }
};

// Show “Edit Article” form (GET /admin/blog/:id/edit)
exports.editForm = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.redirect("/admin/blog");
    res.render("admin/blogForm", {
      title: "Edit Article",
      article,
    });
  } catch (err) {
    console.error("Edit form error:", err);
    res.redirect("/admin/blog");
  }
};

// Update article (POST /admin/blog/:id/edit)
exports.update = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      status,
      category,
      metaDescription,
      keywords,
      action,
    } = req.body;

    const article = await Article.findById(req.params.id);
    if (!article) return res.redirect("/admin/blog");

    // Determine final status based on action
    const finalStatus =
      action === "publish"
        ? "published"
        : action === "draft"
        ? "draft"
        : status;

    article.title = title;
    article.slug = slugify(title, { lower: true, strict: true });
    article.content = content;
    article.excerpt = excerpt;
    article.status = finalStatus;
    article.category = category;
    article.metaDescription = metaDescription;
    article.keywords = keywords;
    article.updatedAt = Date.now();

    // Handle file upload if present
    if (req.file) {
      article.featuredImage = `/image/${req.file.filename}`;
    }

    await article.save();

    req.flash(
      "success",
      `Article ${
        finalStatus === "published" ? "published" : "updated"
      } successfully!`
    );
    res.redirect("/admin/blog");
  } catch (err) {
    console.error("Update article error:", err);
    res.render("admin/blogForm", {
      title: "Edit Article",
      user: req.user,
      article: { ...req.body, _id: req.params.id },
      error: "Failed to update. Please try again.",
    });
  }
};

// Delete article (POST /admin/blog/:id/delete)
exports.remove = async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect("/admin/blog");
  } catch (err) {
    console.error("Delete article error:", err);
    res.redirect("/admin/blog");
  }
};

// In controllers/blogController.js
exports.view = (req, res) => {
  // Mock data for testing
  const article = {
    title: "Test Article Title",
    content:
      "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic wordsThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words",
    author: { username: "TestUser" },
    date: new Date(),
    metaDescription:
      "Learn more about Promontolio and our organic olive oil production.",
    metaKeywords: "about, olive oil, organic, Promontolio",
  };
  res.render("blogSingleArticle", {
    title: article.title,
    article,
    metaDescription: article.metaDescription,
    metaKeywords: article.metaKeywords,
  });
};
