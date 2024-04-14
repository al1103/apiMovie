const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  Movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  name: String,
  slug: String,
  embed: String,
});
module.exports = mongoose.model("Episode", episodeSchema);
