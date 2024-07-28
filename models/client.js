const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          // This regex allows for more flexible phone number formats
          return /^[0-9+\-\s()]{7,20}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid phone number format!`,
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.index({ email: "text", name: "text" });

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
