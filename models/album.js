const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Album title is required'],
    trim: true,
    maxlength: [100, 'Album title cannot be more than 100 characters']
  },
  

  images: [{
    id: String,
    url: String, // Array of strings
  }],
});

module.exports = mongoose.model("Album", bannerSchema);
