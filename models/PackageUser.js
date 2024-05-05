// models/Package.js

const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  subscriptionPlan: {
    type: String,
    enum: ["basic", "premium"],
  },
  subscriptionExpiration: {
    type: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
