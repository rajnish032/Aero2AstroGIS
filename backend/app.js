import dotenv from "dotenv";
dotenv.config();
const requiredEnvVars = [
  "JWT_ACCESS_TOKEN_SECRET_KEY",
  "DATABASE_URL",
  "OTPLESS_CLIENT_ID",
  "OTPLESS_CLIENT_SECRET",
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Error: ${envVar} is required in .env file. Server will not start.`);
    process.exit(1);
  }
});

const port = process.env.PORT || 8000;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectdb.js";
import passport from "passport";
import userRoutes from "./routes/userRoutes.js";
import gisRegistrationRoutes from "./routes/gisRegistrationRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import "./config/passport-jwt-strategy.js";

const app = express();
const DATABASE_URL = process.env.DATABASE_URL;

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_HOST || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "phoneAuth"],
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));

// Database Connection
connectDB(DATABASE_URL);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/gis-registration", gisRegistrationRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "OK", timestamp: new Date() });
});

// Error Handling (must be last)
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`Frontend host: ${process.env.FRONTEND_HOST || "http://localhost:3000"}`);
});