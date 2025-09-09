// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ["author", "editor", "admin", "super"],
    default: "author",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  avatar: {
    type: String, // URL to profile image
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  lastLogin: {
    type: Date,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  emailVerified: {
    type: Boolean,
    default: false,
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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update timestamp on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password on login
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Get full name
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Check if user has permission
userSchema.methods.hasPermission = function (requiredRole) {
  const roleHierarchy = {
    author: 1,
    editor: 2,
    admin: 3,
    super: 4,
  };

  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Record login
userSchema.methods.recordLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
