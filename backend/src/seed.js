const connectDB = require("./utils/Connect");
const CareGuide = require("./models/CareGuide");

require("dotenv").config();

const seedData = async () => {
  await connectDB();

  await CareGuide.deleteMany();

  await CareGuide.insertMany([
    {
      plantType: "Rose",
      sunlightNeeded: "Full Sun",
      wateringTips: "Water twice a week",
      fertilizerTips: "Use rose fertilizer monthly",
      temperatureRange: "15°C - 30°C",
      commonIssues: "Aphids, black spots"
    }
  ]);

  console.log("🌱 Seed Data Inserted");
  process.exit();
};

seedData();
