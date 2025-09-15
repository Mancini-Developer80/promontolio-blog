const { body, validationResult } = require("express-validator");

// Validation helper function
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    req.flash("error", errorMessages.join(", "));
    return res.redirect("back");
  }
  next();
};

// User validation rules
const userValidation = {
  create: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),

    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name cannot exceed 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name cannot exceed 50 characters"),

    body("role")
      .isIn(["author", "editor", "admin"])
      .withMessage("Invalid role selected"),

    handleValidationErrors,
  ],

  update: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name cannot exceed 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name cannot exceed 50 characters"),

    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),

    handleValidationErrors,
  ],
};

// Article validation rules
const articleValidation = {
  create: [
    body("title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title is required and cannot exceed 100 characters"),

    body("content")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Content is required"),

    body("excerpt")
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage("Excerpt cannot exceed 300 characters"),

    body("category")
      .isIn([
        "olive-oil-guide",
        "recipes",
        "health-benefits",
        "production",
        "news",
      ])
      .withMessage("Invalid category selected"),

    body("metaDescription")
      .optional()
      .trim()
      .isLength({ max: 160 })
      .withMessage("Meta description cannot exceed 160 characters"),

    body("keywords")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Keywords cannot exceed 200 characters"),

    handleValidationErrors,
  ],
};

// Login validation rules
const loginValidation = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required"),

  body("password").isLength({ min: 1 }).withMessage("Password is required"),

  handleValidationErrors,
];

// Password change validation
const passwordChangeValidation = [
  body("currentPassword")
    .isLength({ min: 1 })
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),

  handleValidationErrors,
];

module.exports = {
  userValidation,
  articleValidation,
  loginValidation,
  passwordChangeValidation,
  handleValidationErrors,
};
