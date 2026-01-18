const express = require('express');
const connectDB = require('./utils/Connect'); // make sure path is correct

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Your middlewares and routes here

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
