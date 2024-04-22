const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CategorySchema = new Schema({
  group: {
      id: String,
      name: String
  },
  list: [{
      id: String,
      name: String
  }]
});



const EpisodeSchema = new Schema({
  server_name: String,
  items: [{
      name: String,
      slug: String,
      embed: String,
      m3u8: String
  }]
});
const MovieSchema = new mongoose.Schema({
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
      type: Map,
      of: CategorySchema
  },
  episodes: [EpisodeSchema]
});

module.exports = mongoose.model("Moviedetail", MovieSchema);
