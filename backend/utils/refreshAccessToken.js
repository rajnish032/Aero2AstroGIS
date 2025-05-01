import verifyRefreshToken from "./verifyRefreshToken.js";
import generateTokens from "./generateTokens.js";
import UserModel from "../models/User.js";

const refreshAccessToken = async (refreshToken) => {
  try {
    console.log("refreshAccessToken - Starting token refresh:", refreshToken?.slice(0, 20) + "...");

    // Verify refresh token
    const tokenDetails = await verifyRefreshToken(refreshToken);
    console.log("refreshAccessToken - Refresh token verified, user ID:", tokenDetails._id);

    // Fetch user
    const user = await UserModel.findById(tokenDetails._id).select("-password");
    if (!user) {
      console.error("refreshAccessToken - User not found for ID:", tokenDetails._id);
      throw new Error("User not found for this refresh token");
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, accessTokenExp, refreshTokenExp } =
      await generateTokens(user);
    console.log("refreshAccessToken - New tokens generated for user:", user._id);

    return {
      newAccessToken: accessToken,
      newRefreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    console.error("refreshAccessToken - Error:", error.message, error.stack);
    throw new Error(`Failed to refresh access token: ${error.message}`);
  }
};

export default refreshAccessToken;