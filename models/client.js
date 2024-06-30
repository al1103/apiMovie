const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"], // Ensure required field with custom error message
    unique: true,
    trim: true,
    lowercase: true, // Convert email to lowercase for case-insensitive validation
    validate: {
      validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: "Please enter a valid email address",
    },
  },
});

// Adding unique index on email field for uniqueness constraint
clientSchema.index({ email: 1 }, { unique: true });

// Adding text index on email field for text search (optional)
clientSchema.index({ email: "text" });

module.exports = mongoose.model("Client", clientSchema);
