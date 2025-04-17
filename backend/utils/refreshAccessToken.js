import UserModel from "../models/User.js";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";
import generateTokens from "./generateTokens.js";
import verifyRefreshToken from "./verifyRefreshToken.js";

const refreshAccessToken = async (req) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);

    if (error) {
      throw new Error("Invalid refresh token");
    }

    const user = await UserModel.findById(tokenDetails._id);
    if (!user) {
      throw new Error("User not found");
    }

    const userRefreshToken = await UserRefreshTokenModel.findOne({ userId: tokenDetails._id });
    if (!userRefreshToken || oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted) {
      throw new Error("Unauthorized access: Invalid or blacklisted refresh token");
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);
    return {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    throw new Error(`Refresh token failed: ${error.message}`);
  }
};

export default refreshAccessToken;