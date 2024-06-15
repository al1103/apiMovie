const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Remove leading/trailing whitespace for better validation
      minlength: 3, // Enforce a minimum username length for security
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Convert email to lowercase for case-insensitive validation
      validate: {
        validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Enforce a minimum password length for security
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "moderator"], // Define allowed roles for better validation
    },
    avatar: {
      type: String,
      default: "https://placehold.co/40",
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "BlogPost",
      }
     
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ username: "text", email: "text" });

module.exports = mongoose.model("User", userSchema);
