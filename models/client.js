const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    validate: {
      validator: (phone) => /^\+?[1-9]\d{1,14}$/.test(phone),
      message: "Please enter a valid phone number",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: "Please enter a valid email address",
    },
  },
  question: {
    type: String,
    required: [true, "Question is required"],
    trim: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Adding unique index on email field for uniqueness constraint
clientSchema.index({ email: 1 }, { unique: true });

// Adding text index on email and name fields for text search
clientSchema.index({ email: "text", name: "text" });

module.exports = mongoose.model("Client", clientSchema);