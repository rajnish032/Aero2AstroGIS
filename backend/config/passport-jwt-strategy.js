import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import UserModel from "../models/User.js";

const configurePassportJwtStrategy = () => {
  try {
    const secretKey = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("JWT_ACCESS_TOKEN_SECRET_KEY is not defined in environment variables");
    }

    const opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey,
    };

    passport.use(
      new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
          console.log("Passport JWT - Verifying token payload:", {
            _id: jwt_payload._id,
            roles: jwt_payload.roles,
            exp: jwt_payload.exp,
          });

          const user = await UserModel.findOne({ _id: jwt_payload._id }).select("-password");
          if (user) {
            console.log("Passport JWT - User found:", {
              _id: user._id,
              email: user.email,
              roles: user.roles,
            });
            return done(null, user);
          } else {
            console.log("Passport JWT - User not found for ID:", jwt_payload._id);
            return done(null, false);
          }
        } catch (error) {
          console.error("Passport JWT - Error during verification:", error.message, error.stack);
          return done(error, false);
        }
      })
    );

    console.log("✅ Passport JWT strategy configured successfully");
  } catch (error) {
    console.error("❌ Failed to configure Passport JWT strategy:", error.message, error.stack);
    throw error;
  }
};

// Initialize the strategy
configurePassportJwtStrategy();

export default passport;