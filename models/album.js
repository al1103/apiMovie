const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Album title is required"],
    trim: true,
    maxlength: [100, "Album title cannot be more than 100 characters"],
  },

  images: [
    {
      url: String,
    },
  ],
});

module.exports = mongoose.model("Album", bannerSchema);
