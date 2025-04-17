"use client";
import { useFormik } from "formik";
import { changePasswordSchema } from "@/validation/schemas";
import { useChangePasswordMutation } from "@/lib/services/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import toast from "react-hot-toast";

const initialValues = {
  password: "",
  password_confirmation: "",
};

const ChangePassword = () => {
  const [serverErrorMessage, setServerErrorMessage] = useState("");
  const [serverSuccessMessage, setServerSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [changePassword] = useChangePasswordMutation();
  const router = useRouter();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } = useFormik({
    initialValues,
    validationSchema: changePasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await changePassword(values).unwrap(); // unwrap() for RTK Query success data
        if (response.status === "success") {
          setServerSuccessMessage(response.message);
          setServerErrorMessage("");
          resetForm();
          toast.success("Password changed successfully! Please log in again.");
          setTimeout(() => router.push("/account/login"), 2000); // Redirect after 2s
        }
      } catch (error) {
        const errorMsg = error?.data?.message || "Failed to change password. Please try again.";
        setServerErrorMessage(errorMsg);
        setServerSuccessMessage("");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              placeholder="Enter your new password"
              disabled={loading}
            />
            {touched.password && errors.password && (
              <div className="text-sm text-red-500 px-2">{errors.password}</div>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="password_confirmation" className="block font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={values.password_confirmation}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              placeholder="Confirm your new password"
              disabled={loading}
            />
            {touched.password_confirmation && errors.password_confirmation && (
              <div className="text-sm text-red-500 px-2">{errors.password_confirmation}</div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
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

export default ChangePassword;