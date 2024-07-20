const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title : { type: String, 
    required: true,
    unique: true,
  },
  

  images: [{
    id: String,
    url: String, // Array of strings
  }],
});

module.exports = mongoose.model("Album", bannerSchema);
