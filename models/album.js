const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  images: {
    type: [String], // Array of strings
    required: true,
  },
});

module.exports = mongoose.model("Album", bannerSchema);
