const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  slug: {
    type: String,
  },
  original_name: {
    type: String,
  },
  thumb_url: {
    type: String,
  },
  poster_url: {
    type: String,
  },
  modified: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
