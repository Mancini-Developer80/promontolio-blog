const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const Media = require("../models/Media");

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    "./public/media",
    "./public/media/images",
    "./public/media/documents",
    "./public/media/videos",
    "./public/media/audio",
    "./public/media/thumbnails",
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories
createUploadDirs();

// Enhanced storage configuration for media library
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "./public/media";

    // Organize files by type
    if (file.mimetype.startsWith("image/")) {
      uploadPath += "/images";
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath += "/videos";
    } else if (file.mimetype.startsWith("audio/")) {
      uploadPath += "/audio";
    } else {
      uploadPath += "/documents";
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .substring(0, 50);

    const filename = `${baseName}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

// Enhanced file filter for media library
const mediaFileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
    // Videos
    "video/mp4",
    "video/webm",
    "video/ogg",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed!`), false);
  }
};

// Configure enhanced multer for media library
const mediaUpload = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Middleware to process uploaded files and save to database
const processMediaUpload = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    let dimensions = {};
    let category = "other";

    // Determine category based on mimetype
    if (req.file.mimetype.startsWith("image/")) {
      category = "image";

      // Get image dimensions using sharp
      try {
        const metadata = await sharp(req.file.path).metadata();
        dimensions = {
          width: metadata.width,
          height: metadata.height,
        };

        // Generate thumbnail for images
        const thumbnailPath = path.join(
          "./public/media/thumbnails",
          "thumb-" + req.file.filename
        );

        await sharp(req.file.path)
          .resize(300, 300, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
      } catch (error) {
        console.log("Error processing image:", error);
      }
    } else if (req.file.mimetype.startsWith("video/")) {
      category = "video";
    } else if (req.file.mimetype.startsWith("audio/")) {
      category = "audio";
    } else {
      category = "document";
    }

    // Create media record in database
    const mediaRecord = new Media({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: req.file.path.replace("./public", ""),
      category,
      dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined,
      uploadedBy: req.user._id,
      alt: req.body.alt || "",
      title: req.body.title || req.file.originalname,
      description: req.body.description || "",
      tags: req.body.tags
        ? req.body.tags.split(",").map((tag) => tag.trim())
        : [],
    });

    await mediaRecord.save();

    // Add media record to request for further processing
    req.mediaRecord = mediaRecord;
    next();
  } catch (error) {
    console.error("Error processing media upload:", error);

    // Clean up uploaded file if database save fails
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error processing uploaded file",
      error: error.message,
    });
  }
};

// Legacy upload (for backward compatibility)
const legacyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/image");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const legacyFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const legacyUpload = multer({
  storage: legacyStorage,
  fileFilter: legacyFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for legacy uploads
  },
});

module.exports = {
  // New media library upload
  single: (fieldName) => [mediaUpload.single(fieldName), processMediaUpload],
  multiple: (fieldName, maxCount = 10) => [
    mediaUpload.array(fieldName, maxCount),
    processMediaUpload,
  ],

  // Legacy upload (for backward compatibility)
  legacy: legacyUpload,

  // Direct multer instance for custom handling
  mediaUpload,
  processMediaUpload,
};
