const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp) => {
  try {
    const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
    const refreshTokenMaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Secure only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-site in production
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: accessTokenMaxAge,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge,
    });

    res.cookie("is_auth", "true", {
      ...cookieOptions,
      httpOnly: false, // Needed for client-side access
      maxAge: refreshTokenMaxAge,
    });

    console.log("setTokensCookies - Cookies set:", {
      accessToken: accessToken.slice(0, 20) + "...",
      refreshToken: refreshToken.slice(0, 20) + "...",
      is_auth: "true",
      accessTokenMaxAge,
      refreshTokenMaxAge,
    });
  } catch (error) {
    console.error("Error in setTokensCookies:", error.message, error.stack);
    throw new Error(`Failed to set cookies: ${error.message}`);
  }
};

export default setTokensCookies;