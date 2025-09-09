require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const ensureAuth = require("./middleware/ensureAuth");
const ensureRole = require("./middleware/ensureRole");

// Passport config
require("./config/passport");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Sessions & Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/public"));

// Authentication
app.use("/auth", require("./routes/auth"));

// Protected admin blog panel
app.use("/admin/blog", ensureAuth, require("./routes/admin/blog"));

// Protected admin user management
app.use("/admin/users", ensureAuth, require("./routes/admin/userSimple"));

// Protected admin profile settings
app.use("/admin/profile", ensureAuth, require("./routes/admin/profile"));

// Protected admin system settings
app.use("/admin/settings", ensureAuth, require("./routes/admin/settings"));

// Protected admin dashboard
app.use("/admin/dashboard", ensureAuth, require("./routes/admin/dashboard"));

// 404 handler (optional)
app.use((req, res) => {
  res.status(404).render("404", { title: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
