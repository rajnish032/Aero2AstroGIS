import dotenv from "dotenv";
dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "JWT_ACCESS_TOKEN_SECRET_KEY",
  "JWT_REFRESH_TOKEN_SECRET_KEY",
  "DATABASE_URL",
  "OTPLESS_CLIENT_ID",
  "OTPLESS_CLIENT_SECRET",
  "FRONTEND_HOST",
  "EMAIL_FROM",
  "SALT",
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
import path from "path";

const app = express();
const DATABASE_URL = process.env.DATABASE_URL;

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_HOST,
    "http://localhost:3000",
    "https://aero2-astro-gis.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "phoneAuth",
    "X-Requested-With",
    "Cookie",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(passport.initialize());

// Debug: Log incoming requests
app.use((req, res, next) => {
  console.log(`📡 Incoming Request: ${req.method} ${req.url}`);
  console.log("Headers:", {
    authorization: req.headers.authorization,
    cookie: req.headers.cookie,
  });
  console.log("Cookies:", req.cookies);
  console.log("Body:", req.body);
  next();
});

// Serve static files for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Database Connection and Server Startup
const startServer = async () => {
  try {
    await connectDB(DATABASE_URL);
    console.log("✅ MongoDB connected successfully");

    // Routes
    app.use("/api/user", userRoutes);
    app.use("/api/gis-registration", gisRegistrationRoutes);

    // Health Check
    app.get("/health", (req, res) => {
      res.status(200).json({
        success: true,
        status: "OK",
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
      });
    });

    // Error Handling (must be last)
    app.use(errorHandler);

    // Start Server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`Frontend host: ${process.env.FRONTEND_HOST}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message, error.stack);
    process.exit(1);
  }
};

startServer();