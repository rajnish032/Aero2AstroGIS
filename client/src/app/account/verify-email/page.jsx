"use client";
import Link from "next/link";
import { useFormik } from "formik";
import { verifyEmailSchema } from "@/validation/schemas";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVerifyEmailMutation } from "@/lib/services/auth";
import { Spin } from "antd";
import toast from "react-hot-toast";

const initialValues = {
  email: "",
  otp: "",
};

const VerifyEmail = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState("");
  const [serverSuccessMessage, setServerSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [verifyEmail] = useVerifyEmailMutation();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } = useFormik({
    initialValues,
    validationSchema: verifyEmailSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setServerErrorMessage("");
      setServerSuccessMessage("");

      try {
        const response = await verifyEmail(values).unwrap();
        if (response.status === "success") {
          setServerSuccessMessage(response.message);
          resetForm();
          toast.success("Email verified! Redirecting to login...");
          setTimeout(() => router.push("/account/login"), 2000);
        }
      } catch (error) {
        const errorMsg = error?.data?.message || "Failed to verify email. Please try again.";
        setServerErrorMessage(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg relative">
        {loading && (
          <div className="absolute inset-0 opacity-50 bg-gray-200 flex items-center justify-center">
            <Spin size="large" />
          </div>
        )}
        <h2 className="text-2xl font-bold text-center">Verify Your Account</h2>
        <p className="text-sm text-center mb-6 text-gray-400">
          Check your email for OTP. OTP is valid for 15 minutes.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              placeholder="Enter your email"
              disabled={loading}
            />
            {touched.email && errors.email && (
              <div className="text-sm text-red-500 px-2">{errors.email}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="otp" className="block font-medium mb-2">
              OTP
            </label>
            <input
              type="text" // Changed from "otp"
              id="otp"
              name="otp"
              value={values.otp}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              placeholder="Enter your OTP"
              maxLength={4}
              disabled={loading}
            />
            {touched.otp && errors.otp && (
              <div className="text-sm text-red-500 px-2">{errors.otp}</div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
        <p className="text-sm text-gray-600 p-1 text-center">
          Already a User?{" "}
          <Link href="/account/login" className="text-indigo-500 hover:text-indigo-600 transition duration-300 ease-in-out">
            Login
          </Link>
        </p>
        {serverSuccessMessage && (
          <div className="text-sm text-green-500 font-semibold px-2 text-center mt-4">{serverSuccessMessage}</div>
        )}
        {serverErrorMessage && (
          <div className="text-sm text-red-500 font-semibold px-2 text-center mt-4">{serverErrorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;