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

// Mock view for testing formatted content
exports.view = (req, res) => {
  // Mock data with formatted HTML content to demonstrate improvements
  const article = {
    title: "Gli Ulivi del Gargano - Tradizione e Qualità",
    excerpt:
      "Scopri la storia millenaria dei nostri uliveti e il processo di produzione del nostro olio extravergine di oliva biologico, nel cuore del Parco Nazionale del Gargano.",
    content: `
      <h1>La Storia degli Ulivi del Gargano</h1>
      
      <p>Nel cuore del Parco Nazionale del Gargano, tra le rocce calcaree e il profumo del mare Adriatico, crescono da secoli gli ulivi più antichi d'Italia. Questi alberi millenari raccontano una storia di tradizione, passione e dedizione che si tramanda di generazione in generazione.</p>

      <p>I nostri uliveti si estendono per oltre 200 ettari in una delle zone più incontaminate della Puglia, dove il clima mediterraneo e la particolare composizione del terreno creano le condizioni ideali per la produzione di un olio extravergine di oliva di qualità superiore.</p>

      <h2>Il Processo di Produzione Tradizionale</h2>

      <p>La raccolta delle olive avviene esclusivamente a mano, seguendo i metodi tradizionali tramandati dai nostri antenati. Questo processo, seppur più laborioso, garantisce la massima qualità del prodotto finale e il rispetto dell'ambiente.</p>

      <blockquote>
        "L'olio d'oliva non è solo un alimento, ma un patrimonio culturale che racchiude in sé secoli di storia, tradizione e amore per la terra."
      </blockquote>

      <h3>Le Fasi della Produzione</h3>

      <p>Il nostro processo produttivo segue rigorosamente questi passaggi:</p>

      <ol>
        <li><strong>Raccolta a mano</strong> - Le olive vengono raccolte esclusivamente a mano per preservarne l'integrità</li>
        <li><strong>Trasporto immediato</strong> - Dalla pianta al frantoio in meno di 4 ore</li>
        <li><strong>Spremitura a freddo</strong> - Temperatura sempre inferiore ai 27°C</li>
        <li><strong>Filtrazione naturale</strong> - Senza l'uso di sostanze chimiche</li>
        <li><strong>Conservazione ottimale</strong> - In contenitori di acciaio inox</li>
      </ol>

      <h2>Le Varietà Coltivate</h2>

      <p>Nel nostro uliveto coltiviamo diverse varietà autoctone pugliesi, ognuna con le sue caratteristiche organolettiche uniche:</p>

      <ul>
        <li><strong>Coratina</strong> - Caratterizzata da un sapore intenso e piccante</li>
        <li><strong>Ogliarola Garganica</strong> - Dal gusto delicato e fruttato</li>
        <li><strong>Peranzana</strong> - Con note dolci e aroma persistente</li>
        <li><strong>Frantoio</strong> - Equilibrata tra amaro e piccante</li>
      </ul>

      <h2>Sostenibilità e Biologico</h2>

      <p>La nostra azienda è certificata biologica dal 1995. Utilizziamo esclusivamente metodi di coltivazione sostenibili che rispettano l'ambiente e la biodiversità del territorio. Non impieghiamo pesticidi, fertilizzanti chimici o OGM.</p>

      <h3>Il Nostro Impegno per l'Ambiente</h3>

      <p>Crediamo fermamente che la qualità del nostro olio sia strettamente legata alla salute del nostro territorio. Per questo motivo:</p>

      <ul>
        <li>Utilizziamo energie rinnovabili per il 100% dei nostri consumi</li>
        <li>Pratichiamo l'agricoltura rigenerativa per migliorare la fertilità del suolo</li>
        <li>Manteniamo corridoi ecologici per proteggere la fauna locale</li>
        <li>Utilizziamo tecniche di irrigazione a goccia per ottimizzare l'uso dell'acqua</li>
      </ul>

      <blockquote>
        "Ogni goccia del nostro olio racchiude l'essenza del Gargano: il sole, il vento, la terra e l'amore di chi ha dedicato la vita a questa antica arte."
      </blockquote>

      <h2>Riconoscimenti e Certificazioni</h2>

      <p>La qualità del nostro olio extravergine di oliva è stata riconosciuta a livello nazionale e internazionale:</p>

      <ul>
        <li><strong>Medaglia d'Oro</strong> - Concorso Internazionale di Roma 2024</li>
        <li><strong>Certificazione DOP Dauno</strong> - Denominazione di Origine Protetta</li>
        <li><strong>Biologico Certificato</strong> - IT-BIO-007</li>
        <li><strong>Premio Qualità</strong> - Slow Food Presidio</li>
      </ul>

      <p>Ogni bottiglia che lascia la nostra azienda porta con sé non solo un prodotto di eccellenza, ma anche la storia di una famiglia che da quattro generazioni si dedica con passione alla coltivazione degli ulivi.</p>

      <p><em>Scopri il gusto autentico del Gargano, assapora la tradizione.</em></p>
    `,
    author: { username: "Giuseppe Mancini" },
    createdAt: new Date(),
    featuredImage: "/image/organic-olive-harvest-extra-virgin-oil.webp",
    keywords:
      "olio d'oliva, extravergine, biologico, Gargano, tradizione, qualità",
    metaDescription:
      "Scopri la storia e la tradizione dei nostri uliveti nel Gargano. Olio extravergine di oliva biologico di qualità superiore, prodotto con metodi tradizionali.",
  };

  res.render("blogSingleArticle", {
    title: article.title,
    article,
    metaDescription: article.metaDescription,
    metaKeywords: article.keywords,
  });
};
