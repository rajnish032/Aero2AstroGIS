import UserModel from "../models/User.js";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";
import generateTokens from "./generateTokens.js";
import verifyRefreshToken from "./verifyRefreshToken.js";

const refreshAccessToken = async (req) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    console.log('Received refresh token:', oldRefreshToken?.substring(0, 20) + '...');

    if (!oldRefreshToken) {
      throw new Error("No refresh token provided");
    }

    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);
    console.log('Verify refresh token result:', { tokenDetails, error });

    if (error) {
      throw new Error(`Invalid refresh token: ${error}`);
    }

    const user = await UserModel.findById(tokenDetails._id);
    console.log('Fetched user:', user ? user._id : 'Not found');
    if (!user) {
      throw new Error("User not found");
    }

    const userRefreshToken = await UserRefreshTokenModel.findOne({ userId: tokenDetails._id });
    console.log('Fetched user refresh token:', userRefreshToken ? {
      token: userRefreshToken.token.substring(0, 20) + '...',
      blacklisted: userRefreshToken.blacklisted
    } : 'Not found');

    if (!userRefreshToken || oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted) {
      throw new Error("Unauthorized access: Invalid or blacklisted refresh token");
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);
    console.log('Generated new tokens:', {
      accessToken: accessToken.substring(0, 20) + '...',
      refreshToken: refreshToken.substring(0, 20) + '...'
    });

    return {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    console.error('Refresh Access Token Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Refresh token failed: ${error.message}`);
  }
};

export default refreshAccessToken;