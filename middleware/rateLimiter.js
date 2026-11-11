const rateLimit = require("express-rate-limit");

// Limitatore generale per proteggere le risorse del server
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  validate: { xForwardedForHeader: false }, // Disattiva il blocco rigido su trust proxy per Cloud Run
  message: {
    error: "Troppe richieste da questo IP. Riprova più tardi.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Non limitiamo il traffico locale in fase di sviluppo (Frankfurt dev)
    return (
      process.env.NODE_ENV !== "production" &&
      (req.ip === "127.0.0.1" ||
        req.ip === "::1" ||
        req.ip === "::ffff:127.0.0.1")
    );
  },
});

// Blindaggio per il Login (Cruciale per l'area Admin)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: process.env.NODE_ENV === "production" ? 5 : 30,
  validate: { xForwardedForHeader: false }, // Disattiva il blocco rigido su trust proxy per Cloud Run
  skipSuccessfulRequests: true, // Se azzecchi la password, il counter non sale
  message: {
    error: "Troppi tentativi di accesso. Riprova tra 15 minuti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Protezione Form Newsletter / Lead Magnet (Hook Guide PDF)
const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minuti
  max: 10, // Evita che bot scarichino la guida PDF centinaia di volte
  validate: { xForwardedForHeader: false }, // Disattiva il blocco rigido su trust proxy per Cloud Run
  message: {
    error:
      "Hai effettuato troppe richieste per il download della guida. Riprova più tardi.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  loginLimiter,
  apiLimiter,
};
