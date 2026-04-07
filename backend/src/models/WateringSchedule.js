const mongoose = require("mongoose");

const wateringScheduleSchema = new mongoose.Schema(
  {
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant"
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"]
    },
    nextWateringDate: {
      type: Date
    },
    notificationEnabled: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "WateringSchedule",
  wateringScheduleSchema
);
