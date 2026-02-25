const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const prisma = require("../db"); // Il nostro client Prisma

// 1. Creazione directory (Invariata)
const createUploadDirs = () => {
  const dirs = [
    "./public/media/images",
    "./public/media/documents",
    "./public/media/thumbnails",
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};
createUploadDirs();

// 2. Configurazione Storage (Organizzata)
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "./public/media/documents";
    if (file.mimetype.startsWith("image/"))
      uploadPath = "./public/media/images";
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .substring(0, 50);
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB sono sufficienti per Promontolio
});

// 3. Processore Media con salvataggio su PostgreSQL via Prisma
// ... (mantiene i punti 1 e 2 uguali)

// 3. Processore Media (Refactored per gestire file singoli e multipli)
const processMedia = async (file, req) => {
  let dimensions = null;
  let category = file.mimetype.startsWith("image/") ? "IMAGE" : "DOCUMENT";

  if (category === "IMAGE") {
    const metadata = await sharp(file.path).metadata();
    dimensions = { width: metadata.width, height: metadata.height };

    const thumbName = "thumb-" + file.filename;
    await sharp(file.path)
      .resize(300, 300, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(path.join("./public/media/thumbnails", thumbName));
  }

  return await prisma.media.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: file.path.replace("public", "").replace(/\\/g, "/"),
      category: category,
      width: dimensions?.width,
      height: dimensions?.height,
      uploadedBy: req.user.id,
      alt: req.body.alt || "",
      title: req.body.title || file.originalname,
    },
  });
};

// Middleware per carichi singoli
const single = (fieldName) => async (req, res, next) => {
  const upload = mediaUpload.single(fieldName);
  upload(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next();
    try {
      req.mediaRecord = await processMedia(req.file, req);
      next();
    } catch (error) {
      next(error);
    }
  });
};

// Middleware per carichi multipli (QUELLO CHE MANCAVA!)
const array =
  (fieldName, maxCount = 10) =>
  async (req, res, next) => {
    const upload = mediaUpload.array(fieldName, maxCount);
    upload(req, res, async (err) => {
      if (err) return next(err);
      if (!req.files || req.files.length === 0) return next();
      try {
        req.mediaRecords = await Promise.all(
          req.files.map((file) => processMedia(file, req)),
        );
        next();
      } catch (error) {
        next(error);
      }
    });
  };

// Esportazione coerente con routes/admin/media.js
module.exports = {
  single,
  array,
  mediaUpload, // Esportiamo anche l'istanza base se servisse
};
