const connectDB = require("./utils/Connect");
const CareGuide = require("./models/CareGuide");
const User = require('./models/User');

require("dotenv").config();

const seedData = async () => {
  try {
    await connectDB();

    await CareGuide.deleteMany();
    await User.deleteMany();

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

    await User.create({
      username: 'admin',
      email: 'admin@plantcare.local',
      password: 'Admin@123',
      role: 'admin'
    });

    console.log("🌱 Seed Data Inserted (admin + care guides)");
  } catch (error) {
    console.error("❌ Seed Data Failed:", error.message);
  } finally {
    process.exit();
  }
};

seedData();
