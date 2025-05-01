import jwt from "jsonwebtoken";
import User from "../models/User.js";
import createError from "http-errors";

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
    
    // Check multiple token sources
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw createError(401, "Not authorized, no token provided");
    }

    const decoded = verifyJWT(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    
    if (!user) {
      throw createError(401, "User not found, authorization denied");
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle token expiration specifically
    if (error.name === 'TokenExpiredError' && req.cookies?.refreshToken) {
      try {
        const refreshResponse = await axios.post(
          `${process.env.API_BASE_URL}/api/user/refresh-token`, 
          {}, 
          { 
            withCredentials: true,
            headers: {
              Cookie: `refreshToken=${req.cookies.refreshToken}`
            }
          }
        );
        
        if (refreshResponse.data?.accessToken) {
          // Set new tokens in cookies
          setTokensCookies(
            res,
            refreshResponse.data.accessToken,
            refreshResponse.data.refreshToken,
            refreshResponse.data.accessTokenExp,
            refreshResponse.data.refreshTokenExp
          );
          
          // Retry the original request with new token
          req.headers.authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return protect(req, res, next);
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
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
        throw createError(401, "Authentication required");
      }
      
      const userRoles = req.user.roles || ["user"];
      if (!roles.some(role => userRoles.includes(role))) {
        throw createError(403, 
          `User roles ${userRoles.join(", ")} are not authorized to access this route`
        );
      }
      next();
    } catch (error) {
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
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      throw createError(401, "No refresh token provided");
    }

    const decoded = verifyJWT(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw createError(403, "User not found for this refresh token");
    }

    // Optional refresh token validation if stored in user document
    if (user.refreshToken && user.refreshToken !== refreshToken) {
      throw createError(403, "Invalid refresh token");
    }

    req.user = user;
    next();
  } catch (error) {
    const response = {
      success: false,
      message: error.message,
    };
    
    if (process.env.NODE_ENV === "development") {
      response.error = error.stack;
      console.error("Refresh Token Error:", error.message);
    }
    
    res.status(error.status || 500).json(response);
  }
};