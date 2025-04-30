"use client";
import Link from "next/link";
import { useFormik } from "formik";
import { loginSchema } from "@/validation/schemas";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLoginUserMutation } from "@/lib/services/auth";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, {
  path: '/',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production'
});

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const [loginUser] = useLoginUserMutation();

  useEffect(() => {
    const token = cookies.get("accessToken");

    if (token) {
      checkGISStatus();
    }
  }, []);

  const checkGISStatus = () => {
    const user = cookies.get("user");

    if (user) {
      if (user.isGISRegistered) {
        router.push("/gis/dashboard");
      } else {
        router.push("/gis/profile");
      }
    }
  };

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await loginUser(values, {
          credentials: 'include'
        }).unwrap();

        if (response?.status === "success") {
          // Set cookies
          cookies.set("accessToken", response.access_token, {
            path: "/",
            maxAge: 3600,
            sameSite: "lax",
            secure: true,
          });

          cookies.set("user", response.user, {
            path: "/",
            maxAge: 3600,
            sameSite: "lax",
          });

          // document.cookie = `accessToken=${response.access_token}; path=/; max-age=3600; SameSite=Lax`;
          // document.cookie = `user=${encodeURIComponent(JSON.stringify(response.user || {}))}; path=/; max-age=3600; SameSite=Lax`;

          // const expirationDate = new Date(Date.now() + 3600 * 1000); // 1 hour from now
          // cookies.set("auth", token, {
          //   path: "/",
          //   expires: expirationDate,
          //   sameSite: "lax",
          // });

          //const auth = cookies.get('auth');
          // Show success message
          setShowSuccess(true);

          // Redirect after delay
          setTimeout(() => {
            if (response.user.isGISRegistered) {
              router.push("/gis/dashboard");
            } else {
              router.push("/gis/profile");
            }
          }, 1500);

          resetForm();
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
      } catch (error) {
        setErrorMessage(error?.data?.message || "Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Login Successful!</h3>
              <div className="mt-2 text-sm text-gray-500">
                Redirecting you to your profile...
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="overflow-clip relative block mx-auto h-24 w-40">
            <img
              src="/logo.png"
              className="absolute inset-0 scale-150"
              width="100%"
              height="100%"
              alt="Aero2Astro"
            />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register as Partner
            </Link>
          </p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-200"
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-sm text-red-500 px-2">{formik.errors.email}</div>
            )}
          </div>

          {/* Password Field with Show/Hide Icon */}
          <div className="mb-6">
            <label htmlFor="password" className="block font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-sm text-red-500 px-2">{formik.errors.password}</div>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-sm">
            <Link
              href="/account/reset-password-link"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot Your Password?
            </Link>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="mt-2 group relative w-full flex justify-center py-2 px-4 border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
              {loading ? "Logging in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="items-center relative bottom-4 gap-2 flex">
          <p>Not having account?</p>
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register as Partner
          </Link>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-sm text-red-500 font-semibold px-2 text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;