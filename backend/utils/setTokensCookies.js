const setTokensCookies = (
  res,
  accessToken,
  refreshToken,
  accessTokenExp,
  refreshTokenExp
) => {
  const accessTokenMaxAge = (accessTokenExp - Math.floor(Date.now() / 1000)) * 1000; // Convert to ms
  const refreshTokenMaxAge = (refreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: accessTokenMaxAge,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: refreshTokenMaxAge,
  });

  res.cookie("is_auth", true, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: accessTokenMaxAge,
  });

  console.log("setTokensCookies - Cookies set:", {
    accessToken: accessToken.slice(0, 20) + "...",
    refreshToken: refreshToken.slice(0, 20) + "...",
    is_auth: true,
    accessTokenMaxAge,
    refreshTokenMaxAge,
  });
};

export default setTokensCookies;