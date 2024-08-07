const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title: { type: String },
  slug: { type: String, unique: true },
  thumbnail: {
    type: String,
    default: "https://placehold.co/600x400",
  },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  content: { type: String },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

blogPostSchema.index({ title: "text", content: "text" });

blogPostSchema.pre("remove", async function (next) {
  if (this.categoryId) {
    const Category = mongoose.model("Category");
    await Category.findByIdAndUpdate(
      this.categoryId,
      { $pull: { blogPosts: this._id } },
      { new: true }
    );
  }
  next();
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
