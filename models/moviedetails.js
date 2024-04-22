const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  name: String,
  slug: String,
  embed: String,
  m3u8: String
});

const categoryItemSchema = new mongoose.Schema({
  name: String
});

const categoryGroupSchema = new mongoose.Schema({
  name: String
});

const categorySchema = new mongoose.Schema({
  group: categoryGroupSchema,
  list: [categoryItemSchema]
});

const movieSchema = new mongoose.Schema({
  name: String,
  slug: String,
  original_name: String,
  thumb_url: String,
  poster_url: String,
  created: Date,
  modified: Date,
  description: String,
  total_episodes: Number,
  current_episode: String,
  time: String,
  quality: String,
  language: String,
  director: String,
  casts: String,
  category: {
    type: Object,
    default: {},
  },
  episodes: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model('Moviedetail', movieSchema);
