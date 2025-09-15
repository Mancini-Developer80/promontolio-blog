const mongoose = require("mongoose");
const Media = require("./models/Media");

// Load environment variables
require("dotenv").config();

async function getMediaId() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const mediaFiles = await Media.find({}).sort({ createdAt: -1 });

    console.log(`Total media files: ${mediaFiles.length}`);

    mediaFiles.forEach((media, index) => {
      console.log(`\n${index + 1}. ${media.originalName}`);
      console.log(`   ID: ${media._id}`);
      console.log(`   File Path: ${media.path}`);
      console.log(`   URL: ${media.url}`);
      console.log(`   Category: ${media.category}`);
      console.log(`   Size: ${(media.size / 1024).toFixed(2)} KB`);
    });

    // Find the specific logo file
    const logoFile = await Media.findOne({ originalName: /logo-promontolio/i });
    if (logoFile) {
      console.log("\n=== LOGO FILE DETAILS ===");
      console.log("Original Name:", logoFile.originalName);
      console.log("File Path:", logoFile.path);
      console.log("URL:", logoFile.url);
      console.log("ID:", logoFile._id);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

getMediaId();
