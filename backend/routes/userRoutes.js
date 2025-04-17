import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";

router.post("/register", UserController.userRegistration); // Step 0: Phone OTP
router.post("/send-email-otp", UserController.sendEmailOtp); // Step 1: Email OTP
router.post("/verify-email", UserController.verifyEmail);
router.post("/verify-phone", UserController.verifyPhone);
router.post("/login", UserController.userLogin);
router.post("/refresh-token", UserController.getNewAccessToken);
router.post("/reset-password-link", UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);


router.get("/me", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), UserController.userProfile);
router.post("/change-password", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), UserController.changeUserPassword);
router.post("/logout", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), UserController.userLogout);
router.post("/apply-approval",accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), UserController.applyApproval);

export default router;