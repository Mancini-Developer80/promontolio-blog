const Media = require("../models/Media");
const fs = require("fs");
const path = require("path");

// Media Library Dashboard
const mediaLibrary = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || "";
    const search = req.query.search || "";
    const sort = req.query.sort || "newest";

    // Build query
    let query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { originalName: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "name":
        sortQuery = { originalName: 1 };
        break;
      case "size":
        sortQuery = { size: -1 };
        break;
      case "usage":
        sortQuery = { usageCount: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    // Get media with pagination
    const skip = (page - 1) * limit;
    const media = await Media.find(query)
      .populate("uploadedBy", "username")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalMedia = await Media.countDocuments(query);
    const totalPages = Math.ceil(totalMedia / limit);

    // Get statistics
    const stats = await Media.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalSize: { $sum: "$size" },
        },
      },
    ]);

    const totalSize = await Media.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$size" },
        },
      },
    ]);

    res.render("admin/mediaLibrary", {
      title: "Media Library",
      media,
      stats,
      totalSize: totalSize[0]?.totalSize || 0,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page + 1,
        prev: page - 1,
      },
      filters: {
        category,
        search,
        sort,
        limit,
      },
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading media library:", error);
    res.status(500).render("500");
  }
};

// Upload Media Form
const uploadForm = async (req, res) => {
  try {
    res.render("admin/mediaUpload", {
      title: "Upload Media",
      user: req.user,
    });
  } catch (error) {
    console.error("Error rendering upload form:", error);
    res.status(500).render("500");
  }
};

// Handle Media Upload
const uploadMedia = async (req, res) => {
  try {
    if (!req.mediaRecord) {
      req.flash("error", "No file was uploaded or file processing failed");
      return res.redirect("/admin/media/upload");
    }

    req.flash(
      "success",
      `File "${req.mediaRecord.originalName}" uploaded successfully!`
    );

    // If it's an AJAX request, return JSON
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "File uploaded successfully",
        media: req.mediaRecord,
      });
    }

    res.redirect("/admin/media");
  } catch (error) {
    console.error("Error handling media upload:", error);
    req.flash("error", "Error uploading file");

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: error.message,
      });
    }

    res.redirect("/admin/media/upload");
  }
};

// Get Media Details
const getMediaDetails = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate(
      "uploadedBy",
      "username"
    );

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    res.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("Error getting media details:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving media details",
    });
  }
};

// Update Media Details
const updateMedia = async (req, res) => {
  try {
    const { title, alt, description, tags } = req.body;

    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Update fields
    media.title = title || media.title;
    media.alt = alt || media.alt;
    media.description = description || media.description;
    media.tags = tags ? tags.split(",").map((tag) => tag.trim()) : media.tags;

    await media.save();

    req.flash("success", "Media details updated successfully!");

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "Media updated successfully",
        media,
      });
    }

    res.redirect("/admin/media");
  } catch (error) {
    console.error("Error updating media:", error);
    req.flash("error", "Error updating media details");

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message: "Error updating media",
      });
    }

    res.redirect("/admin/media");
  }
};

// Delete Media
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Delete physical files
    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path);
    }

    // Delete thumbnail if it exists
    if (media.category === "image") {
      const thumbnailPath = path.join(
        "./public/media/thumbnails",
        "thumb-" + media.filename
      );
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // Remove from database
    await Media.findByIdAndDelete(req.params.id);

    req.flash("success", "Media deleted successfully!");

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "Media deleted successfully",
      });
    }

    res.redirect("/admin/media");
  } catch (error) {
    console.error("Error deleting media:", error);
    req.flash("error", "Error deleting media");

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message: "Error deleting media",
      });
    }

    res.redirect("/admin/media");
  }
};

// Bulk Operations
const bulkOperation = async (req, res) => {
  try {
    const { operation, mediaIds } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No media selected",
      });
    }

    let result;
    switch (operation) {
      case "delete":
        // Get media records first to delete physical files
        const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

        // Delete physical files
        for (const media of mediaToDelete) {
          if (fs.existsSync(media.path)) {
            fs.unlinkSync(media.path);
          }

          // Delete thumbnail if it exists
          if (media.category === "image") {
            const thumbnailPath = path.join(
              "./public/media/thumbnails",
              "thumb-" + media.filename
            );
            if (fs.existsSync(thumbnailPath)) {
              fs.unlinkSync(thumbnailPath);
            }
          }
        }

        // Delete from database
        result = await Media.deleteMany({ _id: { $in: mediaIds } });
        req.flash(
          "success",
          `${result.deletedCount} media files deleted successfully!`
        );
        break;

      case "updateCategory":
        const { category } = req.body;
        result = await Media.updateMany(
          { _id: { $in: mediaIds } },
          { category }
        );
        req.flash(
          "success",
          `${result.modifiedCount} media files updated successfully!`
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid operation",
        });
    }

    res.json({
      success: true,
      message: "Bulk operation completed successfully",
      result,
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    res.status(500).json({
      success: false,
      message: "Error performing bulk operation",
    });
  }
};

// API endpoint for TinyMCE integration
const getMediaForEditor = async (req, res) => {
  try {
    const { search, category = "image" } = req.query;

    let query = { category };
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { originalName: searchRegex },
        { title: searchRegex },
        { alt: searchRegex },
      ];
    }

    const media = await Media.find(query).sort({ createdAt: -1 }).limit(50);

    const formattedMedia = media.map((item) => ({
      title: item.title || item.originalName,
      value: item.url,
      meta: {
        alt: item.alt,
        width: item.dimensions?.width,
        height: item.dimensions?.height,
      },
    }));

    res.json(formattedMedia);
  } catch (error) {
    console.error("Error getting media for editor:", error);
    res.status(500).json([]);
  }
};

// Media Details View
const mediaDetailsView = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate(
      "uploadedBy",
      "username"
    );

    if (!media) {
      req.flash("error_msg", "Media not found");
      return res.redirect("/admin/media");
    }

    res.render("admin/mediaDetails", {
      media,
      currentRoute: "/admin/media",
    });
  } catch (error) {
    console.error("Error loading media details:", error);
    req.flash("error_msg", "Error loading media details");
    res.redirect("/admin/media");
  }
};

module.exports = {
  mediaLibrary,
  uploadForm,
  uploadMedia,
  getMediaDetails,
  mediaDetailsView,
  updateMedia,
  deleteMedia,
  bulkOperation,
  getMediaForEditor,
};
