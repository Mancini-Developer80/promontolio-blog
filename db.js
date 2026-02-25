const { PrismaClient } = require("@prisma/client");

// Inizializziamo il client una sola volta per tutta l'app
const prisma = new PrismaClient();

module.exports = prisma;
