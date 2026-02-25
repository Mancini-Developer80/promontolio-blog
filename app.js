require("dotenv").config();
const express = require("express");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./db");

const flash = require("connect-flash");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");

const ensureAuth = require("./middleware/ensureAuth");
const { generalLimiter } = require("./middleware/rateLimiter");

// Passport config (Abbiamo già aggiornato questo file per usare Prisma!)
require("./config/passport");

const app = express();

// --- MIDDLEWARES DI SICUREZZA & PERFORMANCE ---
app.use(generalLimiter);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.quilljs.com",
          "https://cdn.jsdelivr.net",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.quilljs.com",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"], // Aggiunto blob: per anteprime immagini
        connectSrc: ["'self'"],
      },
    },
  }),
);
app.use(compression());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// --- VIEW ENGINE ---
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// --- SESSIONE SU POSTGRESQL ---
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 settimana
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Vero solo in produzione con HTTPS
    },
    secret: process.env.SESSION_SECRET || "cambiami_segreto_gargano",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  }),
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// --- GLOBAL LOCALS (Accessibili in tutti i file .ejs) ---
app.use((req, res, next) => {
  const cleanPath = req.path;
  res.locals.path = cleanPath;
  res.locals.currentRoute = cleanPath; // Per compatibilità legacy
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  next();
});

// --- ROUTES ---
app.use("/", require("./routes/public"));
app.use("/auth", require("./routes/auth"));

// Protected admin routes
app.use("/admin/blog", ensureAuth, require("./routes/admin/blog"));
app.use("/admin/users", ensureAuth, require("./routes/admin/user"));

app.use("/admin/settings", ensureAuth, require("./routes/admin/settings"));
app.use("/admin/media", ensureAuth, require("./routes/admin/media"));
app.use("/admin/dashboard", ensureAuth, require("./routes/admin/dashboard"));

// Error handling 404
app.use((req, res) => {
  res.status(404).render("404", { title: "Pagina Non Trovata" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Promontolio Server running on port ${PORT} with PostgreSQL`),
);
