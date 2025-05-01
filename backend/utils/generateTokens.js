import jwt from "jsonwebtoken";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";

const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };
    const accessTokenExp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    console.log('Generating access token for:', payload);
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );

    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // 5 days
    console.log('Generating refresh token for:', payload);
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );

    console.log('Deleting old refresh token for user:', user._id);
    await UserRefreshTokenModel.findOneAndDelete({ userId: user._id });

    console.log('Saving new refresh token for user:', user._id);
    await new UserRefreshTokenModel({
      userId: user._id,
      token: refreshToken,
      blacklisted: false
    }).save();

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    console.error('Token Generation Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

export default generateTokens;