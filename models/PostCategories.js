const mongoose = require("mongoose");

const PostCategories = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
});
module.exports = mongoose.model("PostCategories", PostCategories);
