const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  title: { type: String },
  blogPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" }],
});

categorySchema.pre("remove", async function (next) {
  const BlogPost = mongoose.model("BlogPost");
  await BlogPost.updateMany(
    { categoryId: this._id },
    { $unset: { categoryId: "" } }
  );
  next();
});

module.exports = mongoose.model("Category", categorySchema);
