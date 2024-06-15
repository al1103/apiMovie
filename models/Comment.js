const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

commentSchema.index({ blog: 1 }); 
commentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
