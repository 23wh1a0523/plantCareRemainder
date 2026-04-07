const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    },
    wateringFrequency: {
      type: String
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plant", plantSchema);
