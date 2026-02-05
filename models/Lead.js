const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email ist erforderlich"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Bitte geben Sie eine gültige E-Mail-Adresse an",
    ],
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "unsubscribed"],
    default: "pending", // Utile per il Double Opt-In
  },
  consent: {
    type: Boolean,
    required: true,
    default: false,
  },
  source: {
    type: String,
    default: "PDF_Guide_Organic_Oil", // Per sapere da dove arriva il lead
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Lead", leadSchema);
