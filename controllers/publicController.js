// controllers/publicController.js
// Controller for public routes
const Article = require("../models/Article");

module.exports = {
  getHome: (req, res) => {
    res.render("index", {
      title: "Home",
      metaDescription:
        "Welcome to Promontolio, premium organic olive oil from Gargano.",
      metaKeywords: "olive oil, organic, Gargano, Promontolio",
    });
  },

  getAbout: (req, res) => {
    res.render("about", {
      title: "About Us",
      metaDescription:
        "Learn more about Promontolio and our organic olive oil production.",
      metaKeywords: "about, olive oil, organic, Promontolio",
    });
  },

  getContact: (req, res) => {
    res.render("contact", {
      title: "Contact",
      metaDescription: "Contact Promontolio for inquiries about our products.",
      metaKeywords: "contact, olive oil, Promontolio",
    });
  },

  getProduct: (req, res) => {
    res.render("product", {
      title: "Products",
      metaDescription: "Discover our range of organic olive oil products.",
      metaKeywords: "products, olive oil, organic, Promontolio",
    });
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
          title: "Blog",
          metaDescription: "Read our latest articles and news about olive oil.",
          metaKeywords: "blog, articles, olive oil, Promontolio",
          articles: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          error: "Database not connected.",
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
        title: currentPage > 1 ? `Blog - Page ${currentPage}` : "Blog",
        metaDescription: "Read our latest articles and news about olive oil.",
        metaKeywords: "blog, articles, olive oil, Promontolio",
        articles,
        pagination,
        originalUrl: req.originalUrl,
      });
    } catch (err) {
      console.error("Error loading blog with pagination:", err);
      res.status(500).render("blog", {
        title: "Blog",
        metaDescription: "Read our latest articles and news about olive oil.",
        metaKeywords: "blog, articles, olive oil, Promontolio",
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error: "Unable to load articles.",
        originalUrl: req.originalUrl,
      });
    }
  },
};
