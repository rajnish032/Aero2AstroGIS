const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp) => {
  const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenMaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    maxAge: accessTokenMaxAge,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    maxAge: refreshTokenMaxAge,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  });

  res.cookie("is_auth", true, {
    httpOnly: false,
    secure: isProduction,
    maxAge: refreshTokenMaxAge,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  });
};

export default setTokensCookies;