require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function updateSuperuserPassword() {
  try {
    // 1. Check Ambiente
    if (process.env.NODE_ENV === "production") {
      console.log("❌ This script should not be run in production!");
      process.exit(1);
    }

    console.log("Connecting to PostgreSQL...");

    // 2. Trova il superuser
    // Cerchiamo l'utente con ruolo SUPER (come definito nell'ENUM del tuo schema)
    const superuser = await prisma.user.findFirst({
      where: { role: "SUPER" },
    });

    if (!superuser) {
      console.log(
        "❌ No superuser found. Create one first using createSuperuser.js",
      );
      process.exit(0);
    }

    // 3. Hashing della nuova password
    const newPassword =
      process.env.SUPER_PASSWORD || "YourNewSecurePassword123!";
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 4. Update su database
    await prisma.user.update({
      where: { id: superuser.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(), // Prisma lo fa da solo se configurato, ma è una buona abitudine
      },
    });

    console.log("✅ Superuser password updated successfully!");
    console.log("Username:", superuser.username);
    console.log("New Password:", newPassword);
  } catch (error) {
    console.error("❌ Error updating password:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperuserPassword();
