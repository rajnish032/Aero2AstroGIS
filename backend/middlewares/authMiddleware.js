import jwt from "jsonwebtoken";
import User from "../models/User.js";
import createError from "http-errors";
import axios from "axios";

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
    let token;
    
    // Debug: Log headers and cookies
    console.log("Protect Middleware - Request headers:", req.headers);
    console.log("Protect Middleware - Cookies:", req.cookies);

    // Check multiple token sources
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      console.error("Protect Middleware - No token provided");
      throw createError(401, "Not authorized, no token provided");
    }

    console.log("Protect Middleware - Token:", token);
    const decoded = verifyJWT(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    console.log("Protect Middleware - Decoded token:", decoded);

    const user = await User.findById(decoded._id).select("-password -refreshToken");
    
    if (!user) {
      console.error("Protect Middleware - User not found for ID:", decoded._id);
      throw createError(401, "User not found, authorization denied");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Protect Middleware - Error:", error.message);

    // Handle token expiration with refresh token
    if (error.name === 'TokenExpiredError' && req.cookies?.refreshToken) {
      try {
        console.log("Protect Middleware - Attempting token refresh...");
        const refreshResponse = await axios.post(
          `${process.env.API_BASE_URL}/api/user/refresh-token`, 
          {}, 
          { 
            withCredentials: true,
            headers: {
              Cookie: `refreshToken=${req.cookies.refreshToken}`,
              "Content-Type": "application/json",
            }
          }
        );
        
        console.log("Protect Middleware - Refresh response:", refreshResponse.data);

        if (refreshResponse.data?.accessToken) {
          // Set new tokens in cookies
          setTokensCookies(
            res,
            refreshResponse.data.accessToken,
            refreshResponse.data.refreshToken,
            refreshResponse.data.accessTokenExp,
            refreshResponse.data.refreshTokenExp
          );
          
          // Update the request with the new token
          req.headers.authorization = `Bearer ${refreshResponse.data.accessToken}`;
          console.log("Protect Middleware - Retrying with new token:", refreshResponse.data.accessToken);
          
          // Retry the original request
          const decoded = verifyJWT(refreshResponse.data.accessToken, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
          const user = await User.findById(decoded._id).select("-password -refreshToken");
          
          if (!user) {
            throw createError(401, "User not found after token refresh");
          }

          req.user = user;
          return next();
        } else {
          throw createError(401, "Token refresh failed, no new access token received");
        }
      } catch (refreshError) {
        console.error("Protect Middleware - Refresh token failed:", refreshError.message);
      }
    }
    
    const response = {
      success: false,
      message: error.message,
    };
    
    if (process.env.NODE_ENV === "development") {
      response.error = error.stack;
    }
    
    res.status(error.status || 401).json(response);
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
      console.log("Authorize Middleware - User roles:", userRoles, "Required roles:", roles);

      if (!roles.some(role => userRoles.includes(role))) {
        throw createError(403, 
          `User roles ${userRoles.join(", ")} are not authorized to access this route`
        );
      }
      next();
    } catch (error) {
      console.error("Authorize Middleware - Error:", error.message);
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { error: error.stack }),
      });
    }
  };
};

export const verifyRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    console.log("VerifyRefresh Middleware - Refresh token:", refreshToken);

    if (!refreshToken) {
      console.error("VerifyRefresh Middleware - No refresh token provided");
      throw createError(401, "No refresh token provided");
    }

    const decoded = verifyJWT(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);
    console.log("VerifyRefresh Middleware - Decoded refresh token:", decoded);

    const user = await User.findById(decoded._id);
    if (!user) {
      console.error("VerifyRefresh Middleware - User not found for ID:", decoded._id);
      throw createError(403, "User not found for this refresh token");
    }

    // Optional: Validate refresh token against stored token in database
    if (user.refreshToken && user.refreshToken !== refreshToken) {
      console.error("VerifyRefresh Middleware - Invalid refresh token for user:", user._id);
      throw createError(403, "Invalid refresh token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("VerifyRefresh Middleware - Error:", error.message);
    const response = {
      success: false,
      message: error.message,
    };
    
    if (process.env.NODE_ENV === "development") {
      response.error = error.stack;
    }
    
    res.status(error.status || 500).json(response);
  }
};

// Helper function to set tokens in cookies (unchanged from your original setup)
const setTokensCookies = (res, accessToken, refreshToken, accessTokenExp, refreshTokenExp) => {
  const accessTokenMaxAge = (accessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenMaxAge = (refreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: accessTokenMaxAge
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge
  });

  res.cookie("is_auth", "true", {
    ...cookieOptions,
    httpOnly: false,
    maxAge: refreshTokenMaxAge
  });
};