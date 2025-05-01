import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";
import createError from "http-errors";
import accessTokenAutoRefresh from "../utils/accessTokenAutoRefresh.js";

const verifyJWT = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    const errorMap = {
      TokenExpiredError: createError(401, "Token expired, please log in again"),
      JsonWebTokenError: createError(401, "Invalid token"),
    };
    throw errorMap[error.name] || createError(401, "Token verification failed");
  }
};

export const protect = async (req, res, next) => {
  try {
    console.log("Protect Middleware - Request headers:", {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie,
    });
    console.log("Protect Middleware - Cookies:", req.cookies);

    // Use accessTokenAutoRefresh to handle token refresh
    await accessTokenAutoRefresh(req, res, async () => {
      let token = req.headers.authorization?.split(" ")[1];

      // Fallback to accessToken cookie if Authorization header is missing
      if (!token && req.cookies.accessToken) {
        console.log("Protect Middleware - No Authorization header, using accessToken cookie");
        token = req.cookies.accessToken;
        req.headers.authorization = `Bearer ${token}`; // Set for consistency
      }

      if (!token) {
        console.error("Protect Middleware - No token provided in Authorization header or cookies");
        throw createError(401, "Not authorized, no token provided");
      }

      console.log("Protect Middleware - Verifying token:", token.slice(0, 20) + "...");
      const decoded = verifyJWT(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
      console.log("Protect Middleware - Decoded token:", {
        _id: decoded._id,
        roles: decoded.roles,
        exp: decoded.exp,
      });

      try {
        const user = await UserModel.findById(decoded._id).select("-password");
        if (!user) {
          console.error("Protect Middleware - User not found for ID:", decoded._id);
          throw createError(401, "User not found, authorization denied");
        }
        console.log("Protect Middleware - User found:", {
          _id: user._id,
          email: user.email,
          roles: user.roles,
        });
        req.user = user;
        next();
      } catch (dbError) {
        console.error("Protect Middleware - Database error:", dbError.message, dbError.stack);
        throw createError(500, "Database error during user lookup");
      }
    });
  } catch (error) {
    console.error("Protect Middleware - Error:", error.message, error.stack);
    res.status(error.status || 401).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};

export const verifyRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    console.log("VerifyRefresh Middleware - Refresh token:", refreshToken?.slice(0, 20) + "...");

    if (!refreshToken) {
      console.error("VerifyRefresh Middleware - No refresh token provided in cookies");
      throw createError(401, "No refresh token provided");
    }

    const decoded = verifyJWT(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);
    console.log("VerifyRefresh Middleware - Decoded refresh token:", {
      _id: decoded._id,
      roles: decoded.roles,
      exp: decoded.exp,
    });

    try {
      const tokenRecord = await UserRefreshTokenModel.findOne({
        userId: decoded._id,
        token: refreshToken,
        blacklisted: false,
      });
      if (!tokenRecord) {
        console.error("VerifyRefresh Middleware - Invalid or blacklisted refresh token for user:", decoded._id);
        throw createError(403, "Invalid or blacklisted refresh token");
      }

      const user = await UserModel.findById(decoded._id).select("-password");
      if (!user) {
        console.error("VerifyRefresh Middleware - User not found for ID:", decoded._id);
        throw createError(403, "User not found for this refresh token");
      }

      console.log("VerifyRefresh Middleware - User found:", {
        _id: user._id,
        email: user.email,
        roles: user.roles,
      });
      req.user = user;
      next();
    } catch (dbError) {
      console.error("VerifyRefresh Middleware - Database error:", dbError.message, dbError.stack);
      throw createError(500, "Database error during user lookup");
    }
  } catch (error) {
    console.error("VerifyRefresh Middleware - Error:", error.message, error.stack);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        console.error("Authorize Middleware - No user in request");
        throw createError(401, "Authentication required");
      }

      const userRoles = req.user.roles || ["user"];
      console.log("Authorize Middleware - Checking roles:", {
        userRoles,
        requiredRoles: roles,
      });

      if (!roles.some((role) => userRoles.includes(role))) {
        console.error("Authorize Middleware - Unauthorized role:", userRoles);
        throw createError(
          403,
          `User roles ${userRoles.join(", ")} are not authorized to access this route`
        );
      }
      console.log("Authorize Middleware - Role authorized, proceeding");
      next();
    } catch (error) {
      console.error("Authorize Middleware - Error:", error.message, error.stack);
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    }
  };
};