const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  DEFAULT_LOCALE,
  getLocaleFromRequest,
  getPageByRoute,
  normalizeLocale,
  resolveRouteKey,
  SUPPORTED_LOCALES,
} = require("../config/i18n");

function loadLocaleFile(locale) {
  const filePath = path.join(
    __dirname,
    "..",
    "config",
    `pageTexts.${locale}.json`,
  );
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

test("locale resolution prefers query over cookie and browser language", () => {
  assert.equal(
    getLocaleFromRequest({
      query: { lang: "it" },
      headers: { cookie: "site_lang=de", "accept-language": "de-DE,de;q=0.9" },
    }),
    "it",
  );

  assert.equal(
    getLocaleFromRequest({
      query: {},
      headers: { cookie: "site_lang=it", "accept-language": "de-DE,de;q=0.9" },
    }),
    "it",
  );

  assert.equal(
    getLocaleFromRequest({
      query: {},
      headers: { "accept-language": "it-IT,it;q=0.9,de;q=0.8" },
    }),
    "it",
  );

  assert.equal(
    getLocaleFromRequest({
      query: {},
      headers: { "accept-language": "fr-FR,fr;q=0.9" },
    }),
    DEFAULT_LOCALE,
  );
});

test("route key normalization matches blog pages and dynamic slugs", () => {
  assert.equal(resolveRouteKey("/"), "/");
  assert.equal(resolveRouteKey("/blog"), "/blog");
  assert.equal(resolveRouteKey("/blog/page/2"), "/blog");
  assert.equal(resolveRouteKey("/blog/some-article"), "/blog/:slug");
  assert.equal(resolveRouteKey("/contact/"), "/contact");
});

test("locale files are present and contain the expected public pages", () => {
  for (const locale of SUPPORTED_LOCALES) {
    const data = loadLocaleFile(locale);
    assert.ok(Array.isArray(data.pages), `${locale} locale must define pages`);

    const routes = data.pages.map((page) => page.route);
    [
      "/",
      "/olivenoel-guide",
      "/about",
      "/product",
      "/contact",
      "/impressum",
      "/datenschutz",
      "/thanks",
      "/success",
      "/404",
      "/blog",
      "/blog/:slug",
    ].forEach((route) => {
      assert.ok(routes.includes(route), `${locale} is missing route ${route}`);
    });

    const home = getPageByRoute(locale, "/");
    assert.ok(home?.title, `${locale} home page must have a title`);
    assert.ok(
      home?.metaDescription,
      `${locale} home page must have a meta description`,
    );
  }
});
