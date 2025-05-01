import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import { protect, verifyRefresh } from "../middlewares/authMiddleware.js";
import passport from "passport";

// Public routes
router.post("/register", UserController.userRegistration);
router.post("/send-email-otp", UserController.sendEmailOtp);
router.post("/verify-email", UserController.verifyEmail);
router.post("/verify-phone", UserController.verifyPhone);
router.post("/login", UserController.userLogin);
router.post("/refresh-token", verifyRefresh, UserController.getNewAccessToken);
router.post("/reset-password-link", UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

// Protected routes
router.get("/me", protect, UserController.userProfile);
router.post("/change-password", protect, UserController.changeUserPassword);
router.post("/logout", protect, UserController.userLogout);
router.post("/apply-approval", protect, UserController.applyApproval);

export default router;