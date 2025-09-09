// models/Subscriber.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  token: {
    type: String,
    default: () => uuidv4(), // one-time download link
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: true, // change to false if using double opt-in
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Subscriber", subscriberSchema);
