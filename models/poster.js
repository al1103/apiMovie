const mongoose = require("mongoose");

const posterSchema = new mongoose.Schema({
  posters: [
    {
      url: { type: String },
    },
  ],
  id: { type: String },
});

module.exports = mongoose.model("Poster", posterSchema);
