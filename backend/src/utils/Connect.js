const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    const errorMessage = 'MONGO_URI is not defined. Add it to backend/.env or your environment.';
    console.error('❌ MongoDB Connection Failed', errorMessage);
    throw new Error(errorMessage);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed', error.message);
    throw error;
  }
};

module.exports = connectDB;
