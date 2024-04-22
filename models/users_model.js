const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing

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
    age: {
      type: Number,
      min: 13, // Enforce a minimum age requirement (adjust as needed)
      max: 120, // Enforce a maximum age limit (adjust as needed)
    },
    avatar: {
      type: String,
      default: "https://www.gravatar.com/avatar/",
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment", // Reference the Comment model for proper association
      },
    ],
    favoriteGenres: {
      type: [String], // Array to store multiple genres
      default: [],
    },
  },
  { timestamps: true }
);




module.exports = mongoose.model("User", userSchema);
