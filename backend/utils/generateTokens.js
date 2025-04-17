import jwt from "jsonwebtoken";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";

const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };
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

    await UserRefreshTokenModel.findOneAndDelete({ userId: user._id });
    await new UserRefreshTokenModel({
      userId: user._id,
      token: refreshToken,
    }).save();

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

export default generateTokens;
