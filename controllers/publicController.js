// controllers/publicController.js
// Controller for public routes

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

  getBlog: (req, res) => {
    res.render("blog", {
      title: "Blog",
      metaDescription: "Read our latest articles and news about olive oil.",
      metaKeywords: "blog, articles, olive oil, Promontolio",
    });
  },
};
