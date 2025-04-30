import jwt from "jsonwebtoken";
import User from "../models/User.js";
import createError from "http-errors";
import setTokensCookies from "../utils/setTokensCookies.js";

// Token verification utility
const verifyToken = (token, secret, tokenType = 'access') => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    const errors = {
      TokenExpiredError: createError(
        401, 
        tokenType === 'access' 
          ? 'Access token expired' 
          : 'Refresh token expired, please log in again'
      ),
      JsonWebTokenError: createError(401, `Invalid ${tokenType} token`),
      NotBeforeError: createError(401, `Token not active yet`)
    };
    throw errors[error.name] || createError(401, `Token verification failed`);
  }
};

// Main authentication middleware
export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    
    // Check for token in both header and cookies
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw createError(401, "Authorization token required");
    }

    // Verify access token
    const decoded = verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    
    // Get user and attach to request
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) {
      throw createError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle token refresh if access token expired
    if (error.message === 'Access token expired' && req.cookies?.refreshToken) {
      return refreshAccessToken(req, res, next);
    }
    sendAuthError(res, error);
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, "Authentication required");
      }
      
      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : ["user"];
      if (!roles.some(role => userRoles.includes(role))) {
        throw createError(403, 
          `Insufficient permissions. Required roles: ${roles.join(", ")}`
        );
      }
      next();
    } catch (error) {
      sendAuthError(res, error);
    }
  };
};

// Refresh token verification
export const verifyRefresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      throw createError(401, "Refresh token required");
    }

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, 'refresh');
    const user = await User.findById(decoded._id);

    if (!user) {
      throw createError(404, "User not found");
    }

    // Validate against stored refresh token if present
    if (user.refreshToken && user.refreshToken !== refreshToken) {
      throw createError(403, "Refresh token mismatch");
    }

    req.user = user;
    next();
  } catch (error) {
    sendAuthError(res, error);
  }
};

// Helper to refresh access token
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, 'refresh');
    
    const user = await User.findById(decoded._id);
    if (!user) {
      throw createError(404, "User not found");
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    // Optionally rotate refresh token
    const newRefreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    // Update cookies
    const accessTokenExp = Math.floor(Date.now()/1000) + (15 * 60); // 15 minutes
    const refreshTokenExp = Math.floor(Date.now()/1000) + (7 * 24 * 60 * 60); // 7 days
    
    setTokensCookies(res, newAccessToken, newRefreshToken, accessTokenExp, refreshTokenExp);

    // Update user's refresh token if storing in DB
    if (user.refreshToken) {
      user.refreshToken = newRefreshToken;
      await user.save();
    }

    // Continue with the new token
    req.user = user;
    next();
  } catch (error) {
    sendAuthError(res, error);
  }
};

// Unified error response handler
const sendAuthError = (res, error) => {
  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: error.stack,
      error: error 
    })
  };

  // Clear invalid auth cookies if token verification failed
  if (error.status === 401) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("is_auth");
  }

  res.status(error.status || 500).json(response);
};