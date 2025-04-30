// const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp) => {
//   const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
//   const refreshTokenMaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;
//   const isProduction = process.env.NODE_ENV === "production";

//   const commonCookieOptions = {
//     secure: isProduction,
//     path: "/",
//     sameSite: isProduction ? "none" : "lax", // Changed to "none" for cross-site cookies
//     domain: isProduction ? ".aero2-astro-gis.vercel.app" : undefined
//   };

//   // Access Token (HTTP Only)
//   res.cookie("accessToken", accessToken, {
//     ...commonCookieOptions,
//     httpOnly: true,
//     maxAge: accessTokenMaxAge
//   });

//   // Refresh Token (HTTP Only)
//   res.cookie("refreshToken", refreshToken, {
//     ...commonCookieOptions,
//     httpOnly: true,
//     maxAge: refreshTokenMaxAge
//   });

//   // Auth Flag (accessible to client)
//   res.cookie("is_auth", true, {
//     ...commonCookieOptions,
//     httpOnly: false,
//     maxAge: refreshTokenMaxAge
//   });
// };

// export default setTokensCookies;

const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = isProduction ? "aero2-astro-gis.vercel.app" : undefined;
  
  // Common cookie configuration
  const cookieConfig = {
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain: cookieDomain,
    httpOnly: true
  };

  // Set access token cookie
  res.cookie("accessToken", accessToken, {
    ...cookieConfig,
    maxAge: (newAccessTokenExp - Math.floor(Date.now()/1000)) * 1000
  });

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    ...cookieConfig,
    maxAge: (newRefreshTokenExp - Math.floor(Date.now()/1000)) * 1000
  });

  // Client-readable auth flag
  res.cookie("is_auth", "true", {
    ...cookieConfig,
    httpOnly: false,
    maxAge: (newRefreshTokenExp - Math.floor(Date.now()/1000)) * 1000
  });
};

export default setTokensCookies;