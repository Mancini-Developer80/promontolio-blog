const mongoose = require("mongoose");
const slugify = require("slugify");

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  category: {
    type: String,
    enum: [
      "olive-oil-guide",
      "recipes",
      "health-benefits",
      "production",
      "news",
    ],
  },
  featuredImage: {
    type: String, // Will store the file path/URL
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  keywords: {
    type: String,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  publishedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate slug before saving
articleSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Set publishedAt when status changes to published
articleSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
