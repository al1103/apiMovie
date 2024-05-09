const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  slug: String,
  thumb_url: String,
});
module.exports = mongoose.model("Favorite", FavoriteSchema);
