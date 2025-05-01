import jwt from "jsonwebtoken";

const isTokenExpired = (token) => {
  try {
    console.log("isTokenExpired - Checking token:", token?.slice(0, 20) + "...");
    
    if (!token) {
      console.log("isTokenExpired - No token provided");
      return true;
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.exp) {
      console.log("isTokenExpired - Invalid or no expiration in token");
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decodedToken.exp < currentTime;
    console.log("isTokenExpired - Token expired:", isExpired, {
      exp: decodedToken.exp,
      currentTime,
    });

    return isExpired;
  } catch (error) {
    console.error("isTokenExpired - Error:", error.message, error.stack);
    return true;
  }
};

export default isTokenExpired;
