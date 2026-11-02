const fs = require("fs");
const path = require("path");

const DEFAULT_LOCALE = "de";
const SUPPORTED_LOCALES = ["de", "it"];
const localeCache = new Map();
const LOCALE_COOKIE_NAME = "site_lang";

function normalizeLocale(value) {
  if (!value) return DEFAULT_LOCALE;
  const normalized = String(value).toLowerCase().split("-")[0];
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
}

function resolveRouteKey(routePath) {
  if (!routePath || routePath === "/") {
    return "/";
  }

  if (routePath === "/blog" || routePath.startsWith("/blog/page/")) {
    return "/blog";
  }

  if (routePath.startsWith("/blog/") && routePath !== "/blog/") {
    return "/blog/:slug";
  }

  return routePath.replace(/\/$/, "");
}

function loadLocaleFile(locale) {
  const normalized = normalizeLocale(locale);
  if (localeCache.has(normalized)) {
    return localeCache.get(normalized);
  }

  const filePath = path.join(__dirname, `pageTexts.${normalized}.json`);
  let parsed = {};

  if (fs.existsSync(filePath)) {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } else if (normalized !== DEFAULT_LOCALE) {
    parsed = loadLocaleFile(DEFAULT_LOCALE);
  }

  localeCache.set(normalized, parsed);
  return parsed;
}

function getPageByRoute(locale, routePath) {
  const pageData = loadLocaleFile(locale);
  const resolvedRoute = resolveRouteKey(routePath);
  const pages = Array.isArray(pageData.pages) ? pageData.pages : [];
  const match = pages.find((page) => page.route === resolvedRoute);

  if (match) {
    const metaTags = match.metaTags || {};
    return {
      ...match,
      title: match.title || metaTags.title,
      metaDescription: match.metaDescription || metaTags.metaDescription,
      metaKeywords: match.metaKeywords || metaTags.metaKeywords,
    };
  }

  if (normalizeLocale(locale) !== DEFAULT_LOCALE) {
    return getPageByRoute(DEFAULT_LOCALE, routePath);
  }

  return null;
}

function getLocaleFromRequest(req) {
  if (req.query && req.query.lang) {
    return normalizeLocale(req.query.lang);
  }

  const cookies = parseCookies(req.headers && req.headers.cookie);
  if (cookies[LOCALE_COOKIE_NAME]) {
    return normalizeLocale(cookies[LOCALE_COOKIE_NAME]);
  }

  const headerLocale = req.headers["accept-language"];
  if (headerLocale) {
    const preferred = headerLocale
      .split(",")
      .map((item) => item.trim().split(";")[0])
      .map(normalizeLocale)
      .find((locale) => SUPPORTED_LOCALES.includes(locale));

    if (preferred) {
      return preferred;
    }
  }

  return DEFAULT_LOCALE;
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return String(cookieHeader)
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((acc, cookie) => {
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex < 0) {
        return acc;
      }

      const key = cookie.slice(0, separatorIndex).trim();
      const value = cookie.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function buildLanguageUrl(req, locale) {
  const normalized = normalizeLocale(locale);
  const currentUrl = new URL(req.originalUrl || req.url, "http://localhost");
  currentUrl.searchParams.set("lang", normalized);
  return `${currentUrl.pathname}${currentUrl.search}`;
}

module.exports = {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  buildLanguageUrl,
  getLocaleFromRequest,
  getPageByRoute,
  parseCookies,
  normalizeLocale,
  resolveRouteKey,
};
