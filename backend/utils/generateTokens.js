import jwt from "jsonwebtoken";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";

const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles || ["user"] };
    const accessTokenExp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );

    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // 5 days
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );

    // Remove old refresh token and save new one
    await UserRefreshTokenModel.findOneAndDelete({ userId: user._id });
    await new UserRefreshTokenModel({
      userId: user._id,
      token: refreshToken,
      blacklisted: false,
    }).save();

    console.log("generateTokens - Tokens created for user:", user._id, {
      accessToken: accessToken.slice(0, 20) + "...",
      refreshToken: refreshToken.slice(0, 20) + "...",
      accessTokenExp,
      refreshTokenExp,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    console.error("Error in generateTokens:", error.message, error.stack);
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

export default generateTokens;