"use client";
import Link from "next/link";
import { useFormik } from "formik";
import { resetPasswordLinkSchema } from "@/validation/schemas";
import { useResetPasswordLinkMutation } from "@/lib/services/auth";
import { useState } from "react";
import { Spin } from "antd";
import toast from "react-hot-toast";

const initialValues = { email: "" };

const ResetPasswordLink = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState("");
  const [serverSuccessMessage, setServerSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetPasswordLink] = useResetPasswordLinkMutation();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } = useFormik({
    initialValues,
    validationSchema: resetPasswordLinkSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setServerErrorMessage("");
      setServerSuccessMessage("");

      try {
        const response = await resetPasswordLink(values).unwrap();
        if (response.status === "success") {
          setServerSuccessMessage(response.message);
          resetForm();
          toast.success("Reset link sent! Check your email.");
        }
      } catch (error) {
        const errorMsg = error?.data?.message || "Failed to send reset link. Please try again.";
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
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

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

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Sending email..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-sm text-gray-600 p-1 text-center">
          Not a User?{" "}
          <Link href="/account/register" className="text-indigo-500 hover:text-indigo-600 transition duration-300 ease-in-out">
            Create an account
          </Link>
          {" | "}
          <Link href="/account/login" className="text-indigo-500 hover:text-indigo-600 transition duration-300 ease-in-out">
            Back to Login
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

export default ResetPasswordLink;
