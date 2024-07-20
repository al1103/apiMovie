const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  images: [
    {
      url: { type: String }
    }
  ]
  ,
  id: { type: String }
});

module.exports = mongoose.model("Banner", bannerSchema);