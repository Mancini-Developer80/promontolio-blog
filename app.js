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
const {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  buildLanguageUrl,
  getLocaleFromRequest,
  getPageByRoute,
  parseCookies,
  resolveRouteKey,
} = require("./config/i18n");

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
    store:
      process.env.NODE_ENV === "test"
        ? new session.MemoryStore()
        : new PrismaSessionStore(prisma, {
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
  const locale = getLocaleFromRequest(req);
  const routeKey = resolveRouteKey(cleanPath);
  const cookies = parseCookies(req.headers.cookie);
  const hasLocaleCookie = Boolean(cookies[LOCALE_COOKIE_NAME]);

  if (req.query && req.query.lang) {
    res.cookie(LOCALE_COOKIE_NAME, locale, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else if (!hasLocaleCookie) {
    res.cookie(LOCALE_COOKIE_NAME, locale, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  const appBaseUrl =
    process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const page = getPageByRoute(locale, routeKey) || {};
  const localizedHome = getPageByRoute(locale, "/") || {};

  res.locals.path = cleanPath;
  res.locals.currentRoute = cleanPath; // Per compatibilità legacy
  res.locals.locale = locale;
  res.locals.defaultLocale = DEFAULT_LOCALE;
  res.locals.supportedLocales = SUPPORTED_LOCALES;
  res.locals.languageUrls = SUPPORTED_LOCALES.reduce((acc, currentLocale) => {
    acc[currentLocale] = buildLanguageUrl(req, currentLocale);
    return acc;
  }, {});
  res.locals.alternateUrls = SUPPORTED_LOCALES.reduce((acc, currentLocale) => {
    acc[currentLocale] = `${appBaseUrl}${buildLanguageUrl(req, currentLocale)}`;
    return acc;
  }, {});
  res.locals.canonicalUrl = res.locals.alternateUrls[locale];
  res.locals.pageMeta = page;
  res.locals.footerCopy = localizedHome.footer || {};
  res.locals.title = page.title;
  res.locals.metaDescription = page.metaDescription;
  res.locals.metaKeywords = page.metaKeywords;
  res.locals.pageCopy = page.content || {};
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
  const page = getPageByRoute(res.locals.locale || DEFAULT_LOCALE, "/404");
  res.status(404).render("404", {
    title: (page && page.title) || "Pagina Non Trovata",
    pageCopy: (page && page.content) || {},
  });
});

module.exports = app;
