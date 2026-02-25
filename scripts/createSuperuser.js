require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function createSuperuser() {
  try {
    // 1. Impedisci l'esecuzione in produzione se necessario
    if (process.env.NODE_ENV === "production") {
      console.log("❌ Questo script non deve essere eseguito in produzione!");
      return;
    }

    console.log("Connessione a PostgreSQL tramite Prisma...");

    // 2. Controlla se il superuser esiste già (Role deve essere MAIUSCOLO)
    const existingSuperuser = await prisma.user.findFirst({
      where: { role: "SUPER" },
    });

    if (existingSuperuser) {
      console.log("Il Superuser esiste già:", existingSuperuser.username);
      return;
    }

    // 3. Prepara i dati (Hash della password fondamentale per Passport)
    const rawPassword = process.env.SUPER_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    // 4. Crea il superuser su Postgres
    const superuser = await prisma.user.create({
      data: {
        username: process.env.SUPER_USERNAME || "admin",
        email: process.env.SUPER_EMAIL || "admin@promontolio.it",
        password: hashedPassword,
        role: "SUPER", // Coerente con schema.prisma
        status: "ACTIVE",
        firstName: "Admin",
        lastName: "Promontolio",
      },
    });

    console.log("✅ Superuser creato con successo su PostgreSQL!");
    console.log(`Username: ${superuser.username}`);
    console.log(`Password: (quella definita in .env o 'admin123')`);
  } catch (error) {
    console.error(
      "❌ Errore durante la creazione del superuser:",
      error.message,
    );
  } finally {
    await prisma.$disconnect();
  }
}

createSuperuser();
