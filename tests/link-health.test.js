const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const routeFiles = [
  { file: path.join(root, "routes", "public.js"), prefix: "" },
  { file: path.join(root, "routes", "auth.js"), prefix: "/auth" },
  {
    file: path.join(root, "routes", "admin", "blog.js"),
    prefix: "/admin/blog",
  },
  {
    file: path.join(root, "routes", "admin", "dashboard.js"),
    prefix: "/admin/dashboard",
  },
  {
    file: path.join(root, "routes", "admin", "media.js"),
    prefix: "/admin/media",
  },
  {
    file: path.join(root, "routes", "admin", "settings.js"),
    prefix: "/admin/settings",
  },
  {
    file: path.join(root, "routes", "admin", "user.js"),
    prefix: "/admin/users",
  },
];

const viewFiles = [
  path.join(root, "views", "index.ejs"),
  path.join(root, "views", "about.ejs"),
  path.join(root, "views", "landingPage.ejs"),
  path.join(root, "views", "product.ejs"),
  path.join(root, "views", "contact.ejs"),
  path.join(root, "views", "impressum.ejs"),
  path.join(root, "views", "datenschutz.ejs"),
  path.join(root, "views", "thanks.ejs"),
  path.join(root, "views", "success.ejs"),
  path.join(root, "views", "404.ejs"),
  path.join(root, "views", "blog.ejs"),
  path.join(root, "views", "blogSingleArticle.ejs"),
  path.join(root, "views", "partials", "general", "navbar.ejs"),
  path.join(root, "views", "partials", "general", "footer.ejs"),
  path.join(root, "views", "partials", "cart", "cart-sidebar.ejs"),
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function loadRoutePatterns() {
  const patterns = [];
  for (const entry of routeFiles) {
    const source = fs.readFileSync(entry.file, "utf8");
    const matches = [
      ...source.matchAll(
        /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g,
      ),
    ];
    for (const match of matches) {
      patterns.push(`${entry.prefix}${match[2]}`);
    }
  }
  return patterns;
}

function routeExists(url, patterns) {
  if (patterns.includes(url)) {
    return true;
  }

  return patterns.some((pattern) => {
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\\:[^/]+/g, "[^/]+") +
        "$",
    );
    return regex.test(url);
  });
}

function isStaticAsset(url) {
  const cleanPath = url.split("?")[0].split("#")[0].replace(/^\//, "");
  return cleanPath.length > 0 && fs.existsSync(path.join(publicDir, cleanPath));
}

function isStaticImageAsset(url) {
  const cleanPath = url.split("?")[0].split("#")[0];
  const normalized = cleanPath
    .replace(/^\.{1,2}\//, "")
    .replace(/^\//, "")
    .replace(/^image\//, "image/")
    .replace(/^\.\//, "");

  const candidates = [
    normalized,
    normalized.replace(/^image\//, "image/"),
    normalized.startsWith("image/") ? normalized : `image/${normalized}`,
  ];

  return candidates.some((candidate) => {
    const candidatePath = path.join(publicDir, candidate);
    return candidate && fs.existsSync(candidatePath);
  });
}

function isSkippable(url) {
  return (
    !url ||
    url === "#" ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:") ||
    url.startsWith("javascript:") ||
    url.includes("<%") ||
    url.includes("%>")
  );
}

test("public and shared views do not point to missing internal targets", () => {
  const patterns = loadRoutePatterns();
  const broken = [];

  for (const filePath of viewFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    const matches = [
      ...source.matchAll(/(?:href|action)\s*=\s*"([^"]+)"/g),
      ...source.matchAll(/(?:href|action)\s*=\s*'([^']+)'/g),
    ];

    for (const match of matches) {
      const url = match[1];
      if (isSkippable(url) || !url.startsWith("/")) {
        continue;
      }

      if (routeExists(url, patterns) || isStaticAsset(url)) {
        continue;
      }

      broken.push(`${path.relative(root, filePath)} -> ${url}`);
    }
  }

  assert.deepEqual(
    broken,
    [],
    `Broken internal targets found:\n${broken.join("\n")}`,
  );
});

test("public views reference existing image assets", () => {
  const missingImages = [];

  for (const filePath of viewFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    const matches = [
      ...source.matchAll(/src\s*=\s*"([^"]+)"/g),
      ...source.matchAll(/src\s*=\s*'([^']+)'/g),
    ];

    for (const match of matches) {
      const url = match[1];
      if (
        isSkippable(url) ||
        !url.includes("image") ||
        url.includes("<%") ||
        url.includes("%>")
      ) {
        continue;
      }

      if (isStaticImageAsset(url)) {
        continue;
      }

      missingImages.push(`${path.relative(root, filePath)} -> ${url}`);
    }
  }

  assert.deepEqual(
    missingImages,
    [],
    `Missing image assets found:\n${missingImages.join("\n")}`,
  );
});

test("public download PDF exists", () => {
  const pdfPath = path.join(
    publicDir,
    "download",
    "Giuseppe_Mancini_AI_Solution_Architect_2026.pdf",
  );
  assert.ok(
    fs.existsSync(pdfPath),
    "Expected downloadable PDF to exist in public/download",
  );
});
