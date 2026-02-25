const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("../db"); // Il tuo client Prisma centralizzato

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // 1. Cerchiamo l'utente su PostgreSQL (per username o email)
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: username }, { email: username.toLowerCase() }],
        },
      });

      if (!user) {
        return done(null, false, { message: "Utente non trovato." });
      }

      // 2. Controllo Status (Importante per la sicurezza di Promontolio)
      if (user.status === "INACTIVE") {
        return done(null, false, {
          message: "Account disattivato. Contatta il superuser.",
        });
      }

      // 3. Confronto Password (Bcrypt)
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: "Password errata." });
      }

      // 4. Aggiornamento Last Login (Sostituisce il vecchio recordLogin di Mongoose)
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return done(null, user);
    } catch (err) {
      console.error("Errore critico Passport:", err);
      return done(err);
    }
  }),
);

// Salva l'ID dell'utente nella sessione (PostgresStore)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Recupera l'utente completo dal database usando l'ID della sessione
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
