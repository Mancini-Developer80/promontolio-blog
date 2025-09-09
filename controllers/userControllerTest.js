// controllers/userControllerTest.js
const User = require("../models/User");

// Test basic controller
exports.adminList = async (req, res) => {
  try {
    res.send("User admin list works!");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error");
  }
};

exports.newForm = (req, res) => {
  res.send("New user form works!");
};

exports.create = (req, res) => {
  res.send("Create user works!");
};

exports.editForm = (req, res) => {
  res.send("Edit user form works!");
};

exports.update = (req, res) => {
  res.send("Update user works!");
};

exports.remove = (req, res) => {
  res.send("Remove user works!");
};

exports.resetPassword = (req, res) => {
  res.send("Reset password works!");
};

exports.toggleStatus = (req, res) => {
  res.send("Toggle status works!");
};
