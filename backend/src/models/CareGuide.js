const mongoose = require("mongoose");

const careGuideSchema = new mongoose.Schema(
  {
    plantType: {
      type: String,
      required: true
    },
    sunlightNeeded: String,
    wateringTips: String,
    fertilizerTips: String,
    temperatureRange: String,
    commonIssues: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareGuide", careGuideSchema);
