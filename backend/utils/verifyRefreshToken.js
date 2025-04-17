import jwt from "jsonwebtoken";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";

const verifyRefreshToken = async (refreshToken) => {
  try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;
    const userRefreshToken = await UserRefreshTokenModel.findOne({ token: refreshToken });

    if (!userRefreshToken) {
      throw new Error("Refresh token not found");
    }

    const tokenDetails = jwt.verify(refreshToken, privateKey);
    return tokenDetails;
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
};

export default verifyRefreshToken;