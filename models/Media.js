const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["image", "document", "video", "audio", "other"],
      default: "other",
    },
    dimensions: {
      width: Number,
      height: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
mediaSchema.index({ category: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ mimetype: 1 });
mediaSchema.index({ createdAt: -1 });

// Virtual for file type
mediaSchema.virtual("fileType").get(function () {
  if (this.mimetype.startsWith("image/")) return "image";
  if (this.mimetype.startsWith("video/")) return "video";
  if (this.mimetype.startsWith("audio/")) return "audio";
  if (this.mimetype.includes("pdf")) return "pdf";
  if (this.mimetype.includes("document") || this.mimetype.includes("word"))
    return "document";
  return "file";
});

// Virtual for human-readable file size
mediaSchema.virtual("formattedSize").get(function () {
  const bytes = this.size;
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
});

// Method to increment usage count
mediaSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  return this.save();
};

// Static method to get media by category
mediaSchema.statics.getByCategory = function (category) {
  return this.find({ category }).sort({ createdAt: -1 });
};

// Static method to search media
mediaSchema.statics.search = function (query) {
  const searchRegex = new RegExp(query, "i");
  return this.find({
    $or: [
      { originalName: searchRegex },
      { title: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } },
    ],
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Media", mediaSchema);
