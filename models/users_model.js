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
    age: {
      type: Number,
      min: 13, // Enforce a minimum age requirement (adjust as needed)
      max: 120, // Enforce a maximum age limit (adjust as needed)
    },
    avatar: {
      type: String,
      default: `https://i.pinimg.com/564x/57/3a/88/573a8868f219fa6773799f846e685ed6.jpg`,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    favoriteGenres: {
      type: [String],
      default: [],
    },
    points: {
      type: Number,
      default: 0,
    },
    package: [{ type: Schema.Types.ObjectId, ref: "Package" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
