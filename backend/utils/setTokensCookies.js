const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp) => {
  const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenMaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  
  // Always use these settings for Render deployment
  const cookieOptions = {
    httpOnly: true,
    secure: true,       // Always true for Render
    sameSite: 'none',   // Required for cross-site
    path: '/',
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: accessTokenMaxAge
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge
  });

  res.cookie("is_auth", "true", {
    ...cookieOptions,
    httpOnly: false, // Needed for client-side access
    maxAge: refreshTokenMaxAge
  });
};

export default setTokensCookies;