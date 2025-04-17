
import mongoose from 'mongoose';

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "Geospatial",   
      serverSelectionTimeoutMS: 30000, 
      socketTimeoutMS: 45000, 
      bufferCommands: false,         
    };

    // Connect to the database
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log('Connected Successfully...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message || error);
  }
};

export default connectDB;
