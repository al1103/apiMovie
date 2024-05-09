const mongoose = require('mongoose');


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

movieSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Moviedetail', movieSchema);
