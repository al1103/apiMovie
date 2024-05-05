// models/Package.js

const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  subscriptionPlan: {
    type: String,
    default: "basic",
    enum: ["basic", "premium"],
  },
  subscriptionExpiration: {
    type: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

const Package = mongoose.model("PackageDefault", packageSchema);

module.exports = Package;
