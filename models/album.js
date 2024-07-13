const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title : String,
  images: [{
    type: String, // Array of strings
  }],
});

module.exports = mongoose.model("Album", bannerSchema);
