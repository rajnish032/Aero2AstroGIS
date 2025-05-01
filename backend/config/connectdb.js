import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    const DB_OPTIONS = {
      dbName: "Geospatial",
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      maxPoolSize: 10,
    };

    // Retry connection up to 3 times
    let retries = 3;
    while (retries > 0) {
      try {
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log("✅ MongoDB connected successfully to Geospatial database");
        return;
      } catch (error) {
        retries -= 1;
        console.error(
          `❌ MongoDB connection attempt failed (${retries} retries left):`,
          error.message
        );
        if (retries === 0) {
          throw error;
        }
        // Wait 5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error("❌ Fatal error connecting to MongoDB:", error.message, error.stack);
    if (process.env.NODE_ENV === "production") {
      process.exit(1); // Exit in production to avoid running without DB
    } else {
      throw error; // Throw in development for debugging
    }
  }
};

export default connectDB;