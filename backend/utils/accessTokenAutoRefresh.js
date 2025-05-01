import isTokenExpired from "./isTokenExpired.js";
import refreshAccessToken from "./refreshAccessToken.js";
import setTokensCookies from "./setTokensCookies.js";

const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;
    console.log("accessTokenAutoRefresh - Cookies:", { 
      accessToken: accessToken?.slice(0, 20) + "...", 
      refreshToken: refreshToken?.slice(0, 20) + "...",
    });

    // If valid access token exists, set header and continue
    if (accessToken && !isTokenExpired(accessToken)) {
      console.log("accessTokenAutoRefresh - Valid access token, proceeding");
      req.headers.authorization = `Bearer ${accessToken}`;
      return next();
    }

    // If no refresh token, return error
    if (!refreshToken) {
      console.error("accessTokenAutoRefresh - Refresh token is missing");
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    // Refresh tokens
    console.log("accessTokenAutoRefresh - Refreshing tokens");
    const { 
      newAccessToken, 
      newRefreshToken, 
      newAccessTokenExp, 
      newRefreshTokenExp 
    } = await refreshAccessToken(refreshToken);
    
    console.log("accessTokenAutoRefresh - New tokens generated:", {
      newAccessToken: newAccessToken.slice(0, 20) + "...",
      newRefreshToken: newRefreshToken.slice(0, 20) + "...",
    });

    setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp);
    req.headers.authorization = `Bearer ${newAccessToken}`;
    next();
  } catch (error) {
    console.error("accessTokenAutoRefresh - Error:", error.message, error.stack);
    res.status(401).json({
      success: false,
      message: error.message || "Failed to refresh access token",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};

export default accessTokenAutoRefresh;