const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// MongoDB connection string
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        serverSelectionTimeoutMS: 30000,  // 30 seconds timeout
        socketTimeoutMS: 45000, 
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
