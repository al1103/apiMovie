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
  created: {
    type: Date,
    default: Date.now,
  },
  modified: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  total_episodes: {
    type: Number,
  },
  current_episode: {
    type: String,
  },
  time: {
    type: String,
  },
  quality: {
    type: String,
  },
  language: {
    type: String,
  },
  director: {
    type: String,
    default: null,
  },
  casts: {
    type: String,
  },
  category: {
    type: Object,
    default: {},
  },
  episodes: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Moviedetail", movieSchema);
