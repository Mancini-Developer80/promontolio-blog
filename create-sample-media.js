const mongoose = require("mongoose");
const Media = require("./models/Media");
const User = require("./models/User");
const path = require("path");
const fs = require("fs");

// Load environment variables
require("dotenv").config();

// Sample media data
const sampleMedia = [
  {
    originalName: "promontolio-banner.png",
    filename: "banner_1703456789000.png",
    path: "public/image/promontolio-banner.png",
    url: "/image/promontolio-banner.png",
    mimetype: "image/png",
    size: 245760,
    category: "image",
    title: "Promontolio Main Banner",
    description:
      "Main promotional banner for Promontolio olive oil brand featuring the logo and product imagery.",
    alt: "Promontolio olive oil banner with logo and bottles",
    usage: "hero",
    tags: ["banner", "promontolio", "branding", "hero"],
    dimensions: { width: 1200, height: 400 },
  },
  {
    originalName: "logo-promontolio.png",
    filename: "logo_1703456790000.png",
    path: "public/image/logo-promontolio.png",
    url: "/image/logo-promontolio.png",
    mimetype: "image/png",
    size: 58432,
    category: "image",
    title: "Promontolio Logo",
    description: "Official Promontolio company logo with olive tree motif.",
    alt: "Promontolio company logo",
    usage: "general",
    tags: ["logo", "branding", "promontolio"],
    dimensions: { width: 300, height: 150 },
  },
  {
    originalName: "organic-olive-harvest-extra-virgin-oil.webp",
    filename: "harvest_1703456791000.webp",
    path: "public/image/organic-olive-harvest-extra-virgin-oil.webp",
    url: "/image/organic-olive-harvest-extra-virgin-oil.webp",
    mimetype: "image/webp",
    size: 187296,
    category: "image",
    title: "Organic Olive Harvest",
    description:
      "Beautiful image showcasing the organic olive harvest process for extra virgin olive oil production.",
    alt: "Hands holding fresh organic olives during harvest",
    usage: "blog",
    tags: ["harvest", "organic", "olives", "extra-virgin", "traditional"],
    dimensions: { width: 800, height: 600 },
  },
  {
    originalName: "ancient-olive-grove-path.webp",
    filename: "grove_1703456792000.webp",
    path: "public/image/ancient-olive-grove-path.webp",
    url: "/image/ancient-olive-grove-path.webp",
    mimetype: "image/webp",
    size: 234567,
    category: "image",
    title: "Ancient Olive Grove Path",
    description:
      "Scenic path through an ancient olive grove in the Gargano region, showcasing centuries-old olive trees.",
    alt: "Stone path winding through ancient olive trees",
    usage: "gallery",
    tags: ["grove", "ancient", "path", "gargano", "landscape"],
    dimensions: { width: 1024, height: 768 },
  },
  {
    originalName: "stone-olive-press-in-olive-grove.webp",
    filename: "press_1703456793000.webp",
    path: "public/image/stone-olive-press-in-olive-grove.webp",
    url: "/image/stone-olive-press-in-olive-grove.webp",
    mimetype: "image/webp",
    size: 298765,
    category: "image",
    title: "Traditional Stone Olive Press",
    description:
      "Historic stone olive press in a traditional olive grove, representing centuries of olive oil making tradition.",
    alt: "Ancient stone olive press surrounded by olive trees",
    usage: "blog",
    tags: ["traditional", "stone-press", "history", "olive-oil", "heritage"],
    dimensions: { width: 900, height: 675 },
  },
  {
    originalName: "promontolio-olive-oil-bottles.webp",
    filename: "bottles_1703456794000.webp",
    path: "public/image/promontolio-olive-oil-bottles.webp",
    url: "/image/promontolio-olive-oil-bottles.webp",
    mimetype: "image/webp",
    size: 176543,
    category: "image",
    title: "Promontolio Product Bottles",
    description:
      "Professional product photography of Promontolio extra virgin olive oil bottles in various sizes.",
    alt: "Promontolio olive oil bottles arranged for product display",
    usage: "product",
    tags: ["product", "bottles", "packaging", "photography"],
    dimensions: { width: 600, height: 800 },
  },
];

async function createSampleMedia() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get the first admin or super user
    const adminUser = await User.findOne({
      $or: [{ role: "admin" }, { role: "super" }],
    });
    if (!adminUser) {
      console.log(
        "❌ No admin or super user found. Please create an admin user first."
      );
      return;
    }
    console.log(`📋 Using user: ${adminUser.email} (${adminUser.role})`);

    // Clear existing media
    await Media.deleteMany({});
    console.log("Cleared existing media");

    // Create sample media entries
    const createdMedia = [];
    for (const mediaData of sampleMedia) {
      // Check if file exists
      const filePath = path.join(__dirname, mediaData.path);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        mediaData.size = stats.size;
        mediaData.uploadedBy = adminUser._id; // Add the required uploadedBy field

        const media = new Media(mediaData);
        await media.save();
        createdMedia.push(media);
        console.log(`✅ Created media: ${media.title}`);
      } else {
        console.log(`⚠️  File not found: ${mediaData.path}`);
      }
    }

    console.log(
      `\n🎉 Successfully created ${createdMedia.length} sample media entries!`
    );

    // Display summary
    const stats = await Media.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    console.log("\n📊 Media Library Summary:");
    stats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count} files`);
    });

    const totalSize = await Media.aggregate([
      { $group: { _id: null, totalSize: { $sum: "$size" } } },
    ]);

    if (totalSize.length > 0) {
      const sizeInMB = (totalSize[0].totalSize / (1024 * 1024)).toFixed(2);
      console.log(`   Total size: ${sizeInMB} MB`);
    }
  } catch (error) {
    console.error("❌ Error creating sample media:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
createSampleMedia();
