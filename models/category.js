const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  title: { type: String },
  blog: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }], // references to Blog model
});
module.exports = mongoose.model("Category", categorySchema);
