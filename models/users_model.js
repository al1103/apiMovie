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
      default: `
      <svg id="Layer_1" style="enable-background:new 0 0 64 64;" version="1.1" viewBox="0 0 64 64" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style type="text/css">
        .st0{fill:#134563;}
      </style><g><g id="Icon-User" transform="translate(278.000000, 278.000000)"><path class="st0" d="M-246-222.1c-13.2,0-23.9-10.7-23.9-23.9s10.7-23.9,23.9-23.9c13.2,0,23.9,10.7,23.9,23.9     S-232.8-222.1-246-222.1L-246-222.1z M-246-267.3c-11.7,0-21.3,9.6-21.3,21.3c0,11.7,9.6,21.3,21.3,21.3     c11.7,0,21.3-9.6,21.3-21.3C-224.7-257.7-234.3-267.3-246-267.3L-246-267.3z" id="Fill-57"/><path class="st0" d="M-260-228.7l-2.4-1.1c0.7-1.7,2.9-2.6,5.4-3.7c2.4-1.1,5.4-2.4,5.4-4v-2.2     c-0.9-0.7-2.3-2.3-2.5-4.6c-0.7-0.7-1.8-2-1.8-3.6c0-1,0.4-1.8,0.7-2.3c-0.2-1.1-0.6-3.3-0.6-5c0-5.5,3.8-9.1,9.8-9.1     c1.7,0,3.8,0.5,4.9,1.7c2.7,0.5,4.9,3.7,4.9,7.4c0,2.4-0.4,4.4-0.7,5.3c0.3,0.5,0.6,1.2,0.6,2c0,1.9-0.9,3.1-1.8,3.7     c-0.2,2.3-1.5,3.8-2.3,4.5v2.2c0,1.4,2.5,2.3,4.8,3.2c2.7,1,5.5,2,6.4,4.3l-2.5,0.9c-0.4-1.2-2.8-2-4.8-2.8     c-3.1-1.1-6.6-2.4-6.6-5.6v-3.6l0.6-0.4c0.1,0,1.8-1.2,1.8-3.5v-0.9l0.8-0.3c0.1-0.1,0.9-0.5,0.9-1.7c0-0.4-0.3-0.8-0.4-0.9     l-0.5-0.6l0.2-0.7c0,0,0.7-2.2,0.7-5.2c0-2.5-1.4-4.8-2.9-4.8h-0.8l-0.4-0.7c-0.3-0.5-1.5-1-3.1-1c-4.5,0-7.2,2.4-7.2,6.5     c0,1.9,0.7,5,0.7,5l0.2,0.7l-0.5,0.5c0,0-0.4,0.5-0.4,1c0,0.7,0.9,1.6,1.3,2l0.5,0.4l0,0.7c0,2.2,1.9,3.4,1.9,3.4l0.6,0.4l0,3.6     c0,3.3-3.7,5-7,6.4C-257.5-230.4-259.6-229.4-260-228.7" id="Fill-58"/></g></g></svg>`,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);