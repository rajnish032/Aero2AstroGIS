import refreshAccessToken from "../utils/refreshAccessToken.js";
import isTokenExpired from "../utils/isTokenExpired.js";
import setTokensCookies from "../utils/setTokensCookies.js";

const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    // If valid access token exists, set header and continue
    if (accessToken && !isTokenExpired(accessToken)) {
      req.headers.authorization = `Bearer ${accessToken}`;
      return next();
    }

    // If no refresh token, return error
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    // Refresh tokens
    const { 
      newAccessToken, 
      newRefreshToken, 
      newAccessTokenExp, 
      newRefreshTokenExp 
    } = await refreshAccessToken(req, res);
    
    setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp);
    req.headers.authorization = `Bearer ${newAccessToken}`;
    next();
  } catch (error) {
    console.error("Access Token Auto Refresh Error:", error.message);
    const response = {
      success: false,
      message: error.message || "Failed to refresh access token",
    };
    
    if (process.env.NODE_ENV === "development") {
      response.stack = error.stack;
    }
    
    res.status(401).json(response);
  }
};

export default accessTokenAutoRefresh;