const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  images: {
    type: [String], // Array of strings
    required: true,
    validate: {
      validator: function (array) {
        return array.length === 3;
      },
      message: "Banner must contain exactly 3 image links.",
    },
  },
  // ... (các trường khác nếu cần)
});

module.exports = mongoose.model("Banner", bannerSchema);
