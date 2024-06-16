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
  content: { type: String },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

blogPostSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("BlogPost", blogPostSchema);
