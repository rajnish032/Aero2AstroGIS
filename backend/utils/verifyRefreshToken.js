import jwt from "jsonwebtoken";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";

const verifyRefreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;
    console.log('Verifying refresh token:', refreshToken.substring(0, 20) + '...');

    const userRefreshToken = await UserRefreshTokenModel.findOne({ token: refreshToken });
    console.log('Found refresh token in DB:', userRefreshToken ? 'Yes' : 'No');

    if (!userRefreshToken) {
      throw new Error("Refresh token not found");
    }

    const tokenDetails = jwt.verify(refreshToken, privateKey);
    console.log('Token details:', tokenDetails);

    return { tokenDetails, error: null };
  } catch (error) {
    console.error('Verify Refresh Token Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return { tokenDetails: null, error: error.message };
  }
};

export default verifyRefreshToken;