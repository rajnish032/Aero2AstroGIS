import express from "express";
import UserController from "../controllers/userController.js"
import { protect, verifyRefresh, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", UserController.userRegistration);
router.post("/verify-phone", UserController.verifyPhone);
router.post("/send-email-otp", UserController.sendEmailOtp);
router.post("/verify-email", UserController.verifyEmail);
router.post("/login", UserController.userLogin);
router.post("/password-reset-email", UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

// Protected routes
router.get("/me", protect, UserController.userProfile);
router.post("/change-password", protect, UserController.changeUserPassword);
router.post("/logout", protect, UserController.userLogout);
router.get("/get-new-access-token", verifyRefresh, UserController.getNewAccessToken);
router.post("/apply-approval", protect, authorize("user"), UserController.applyApproval);

export default router;