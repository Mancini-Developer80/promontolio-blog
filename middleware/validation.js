const { body, validationResult } = require("express-validator");

// Helper per gestire gli errori e visualizzarli con Flash
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    req.flash("error", errorMessages.join(" | "));
    return res.redirect("back");
  }
  next();
};

// User validation rules (Sincronizzato con ENUM Prisma)
const userValidation = {
  create: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Lo username deve essere tra 3 e 30 caratteri")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Lo username può contenere solo lettere, numeri e underscore",
      ),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Inserisci un indirizzo email valido"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("La password deve avere almeno 8 caratteri")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "La password deve contenere una maiuscola, una minuscola e un numero",
      ),

    body("role")
      // Mappiamo i ruoli come definiti nel Prisma Schema
      .isIn(["AUTHOR", "EDITOR", "ADMIN", "SUPER"])
      .withMessage("Ruolo selezionato non valido"),

    handleValidationErrors,
  ],

  update: [
    body("username").trim().isLength({ min: 3, max: 30 }),
    body("email").isEmail().normalizeEmail(),
    body("firstName").optional().trim().isLength({ max: 50 }),
    body("lastName").optional().trim().isLength({ max: 50 }),
    body("bio").optional().trim().isLength({ max: 500 }),
    handleValidationErrors,
  ],
};

// Article validation rules (Fondamentale per il Blog di Promontolio)
const articleValidation = {
  create: [
    body("title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Il titolo è obbligatorio (max 100 caratteri)"),

    body("content")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Il contenuto è richiesto"),

    body("category")
      // Qui usiamo i nomi delle categorie che userai nel Blog (Gargano, Ricette, etc)
      .isIn(["OLIVE_OIL_GUIDE", "RECIPES", "HEALTH", "PRODUCTION", "NEWS"])
      .withMessage("Categoria non valida"),

    handleValidationErrors,
  ],
};

// Login validation (Essenziale per entrare in Admin)
const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username richiesto"),
  body("password").notEmpty().withMessage("Password richiesta"),
  handleValidationErrors,
];

module.exports = {
  userValidation,
  articleValidation,
  loginValidation,
  handleValidationErrors,
};
