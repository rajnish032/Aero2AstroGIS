import jwt from "jsonwebtoken";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";

const verifyRefreshToken = async (refreshToken) => {
  try {
    console.log("verifyRefreshToken - Checking token:", refreshToken?.slice(0, 20) + "...");
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;
    
    const userRefreshToken = await UserRefreshTokenModel.findOne({ 
      token: refreshToken,
      blacklisted: false 
    });

    if (!userRefreshToken) {
      console.error("verifyRefreshToken - Refresh token not found or blacklisted");
      throw new Error("Refresh token not found or blacklisted");
    }

    const tokenDetails = jwt.verify(refreshToken, privateKey);
    console.log("verifyRefreshToken - Token verified, user ID:", tokenDetails._id);

    return tokenDetails;
  } catch (error) {
    console.error("verifyRefreshToken - Error:", error.message, error.stack);
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
};

export default verifyRefreshToken;