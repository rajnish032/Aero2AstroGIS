// src/validation/schemas.jsx
import * as Yup from "yup";

// Login Schema
export const loginSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// Register Schema
export const registerSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().required("Email is required").email("Invalid email format"),
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  countryCode: Yup.string().required("Country code is required"),
  areaPin: Yup.string()
    .matches(/^\d{6}$/, "Pin code must be 6 digits")
    .required("Pin code is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  locality: Yup.string().required("Locality is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("Password is required"),
  password_confirmation: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password"), null], "Password and Confirm Password don't match"),
});

// Reset Password Schema
export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("Password is required"),
  password_confirmation: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password"), null], "Password and Confirm Password don't match"),
});

// Change Password Schema (reuse resetPasswordSchema)
export const changePasswordSchema = resetPasswordSchema;

// Reset Password Link Schema
export const resetPasswordLinkSchema = Yup.object({
  email: Yup.string().required("Email is required").email("Invalid email format"),
});

// Verify Email Schema
export const verifyEmailSchema = Yup.object({
  email: Yup.string().required("Email is required").email("Invalid email format"),
  otp: Yup.string().matches(/^\d{4}$/, "OTP must be a 4-digit number").required("OTP is required"),
});
