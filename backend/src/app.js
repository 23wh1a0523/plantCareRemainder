const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./utils/Connect');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Route mounting
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const plantRoutes = require('./routes/plantRoutes');
const careGuideRoutes = require('./routes/careGuideRoutes');
const wateringScheduleRoutes = require('./routes/wateringScheduleRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/care-guides', careGuideRoutes);
app.use('/api/watering-schedules', wateringScheduleRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Internal server error', error: err.message || 'Internal server error' });
});

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
