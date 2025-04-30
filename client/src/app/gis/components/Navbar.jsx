"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "antd";
import axios from "axios";
import Cookies from "universal-cookie";
import toast from "react-hot-toast";

const cookies = new Cookies(null, {
  path: '/',
  sameSite: 'none',
  secure: true
});

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for existing access token
      let accessToken = cookies.get("accessToken");
      
      // First attempt to fetch user data
      let response = await axios.get(`${API_BASE_URL}/api/user/me`, {
        withCredentials: true,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      }).catch(err => err.response || err);

      // Handle 401 Unauthorized (token expired)
      if (response?.status === 401) {
        try {
          // Attempt to refresh token
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );

          if (refreshResponse.data?.accessToken) {
            // Store new tokens
            cookies.set("accessToken", refreshResponse.data.accessToken, {
              path: '/',
              sameSite: 'none',
              secure: true,
              maxAge: 3600
            });

            // Retry with new token
            response = await axios.get(`${API_BASE_URL}/api/user/me`, {
              withCredentials: true,
              headers: { 
                Authorization: `Bearer ${refreshResponse.data.accessToken}` 
              }
            });
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw new Error("Session expired. Please login again.");
        }
      }

      // Handle successful response
      if (response?.data?.user) {
        setUser({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          isGISRegistered: response.data.user.isGISRegistered || false,
          status: response.data.user.status || "pending",
          roles: response.data.user.roles || ["user"],
          isApplied: response.data.user.isApplied || false,
        });
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Navbar authentication error:", error);
      setError(error.message);
      
      // Clear invalid credentials
      cookies.remove("accessToken", { path: '/' });
      cookies.remove("refreshToken", { path: '/' });
      cookies.remove("is_auth", { path: '/' });
      
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Set up periodic token refresh (every 50 minutes)
    const refreshInterval = setInterval(() => {
      if (cookies.get("accessToken")) {
        axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        ).then(response => {
          if (response.data?.accessToken) {
            cookies.set("accessToken", response.data.accessToken, {
              path: '/',
              sameSite: 'none',
              secure: true,
              maxAge: 3600
            });
          }
        }).catch(err => {
          console.error("Background token refresh failed:", err);
        });
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const handleApplyForApproval = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/apply-approval`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setUser(prev => ({
          ...prev,
          isApplied: true,
          status: "review",
        }));
        toast.success("Application submitted for approval!");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.response?.data?.message || "Failed to apply for approval");
      
      // If unauthorized, try to refresh token and retry
      if (error.response?.status === 401) {
        try {
          await fetchUser(); // This will attempt token refresh
          return handleApplyForApproval(); // Retry the request
        } catch (refreshError) {
          toast.error("Session expired. Please login again.");
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/logout`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        // Clear all auth cookies
        cookies.remove("accessToken", { path: "/" });
        cookies.remove("refreshToken", { path: "/" });
        cookies.remove("is_auth", { path: "/" });
        
        setUser(null);
        toast.success("Logged out successfully");
        window.location.href = "/account/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const getProfileLink = () => {
    if (!user) return "/account/login";
    return user.isGISRegistered ? "/gis/profile" : "/account/profile";
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-[2000] border-b border-blue-400 mb-5 shadow-md bg-white text-gray-700">
        <div className="max-w-screen-xl relative flex flex-wrap items-center justify-between px-3 lg:px-5">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <div className="hidden md:flex flex-col gap-1">
              <div className="h-4 w-24 bg-gray-300 rounded"></div>
              <div className="h-3 w-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-[2000] border-b border-blue-400 mb-5 shadow-md bg-white text-gray-700">
      <div className="max-w-screen-xl relative flex flex-wrap items-center justify-between px-3 lg:px-5">
        {/* Logo */}
        <Link href="/" className="lg:mx-20 inline-flex overflow-hidden relative md:w-[300px] h-16 w-[150px] items-center">
          <Image
            src="/logo.png"
            alt="Aero2Astro"
            width={150}
            height={50}
            className="max-sm:scale-[1.4] lg:scale-[1.1]"
            priority
          />
        </Link>

        {/* Navigation */}
        <div className="gap-3 flex text-sm lg:mx-4 lg:justify-end flex-grow items-center max-md:hidden">
          {user && (
            <Link
              className="font-semibold px-2 hover:text-blue-400 transition-colors"
              href={getProfileLink()}
            >
              {user.isGISRegistered ? "GIS Profile" : "Complete Profile"}
            </Link>
          )}
          {user?.isGISRegistered && (
            <Link
              className="font-semibold px-2 hover:text-blue-500 transition-colors"
              href="/gis/dashboard"
            >
              Dashboard
            </Link>
          )}
          {user && !user.isApplied && (
            <button
              className="font-semibold text-white py-1 px-2 rounded hover:bg-blue-600 bg-blue-500 transition-colors"
              onClick={handleApplyForApproval}
              disabled={loading}
            >
              Apply for Approval
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="items-center flex md:flex-row-reverse gap-5 relative">
          {error ? (
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-sm">Session expired</span>
              <Link
                href="/account/login"
                className="text-blue-500 hover:underline text-sm"
              >
                Login
              </Link>
            </div>
          ) : user ? (
            <>
              <div className="w-fit py-2">
                <p className="font-semibold max-sm:text-sm">{user.name}</p>
                <p className="text-xs capitalize">{user.roles[0]}</p>
                <p className="text-xs mt-1">
                  {user.status === "pending" && (
                    <span className="bg-red-600 px-1 text-white">Not Applied</span>
                  )}
                  {user.status === "review" && (
                    <span className="bg-yellow-600 px-1 text-white">Review</span>
                  )}
                  {user.status === "rejected" && (
                    <span className="bg-red-600 px-1 text-white">Rejected</span>
                  )}
                  {user.status === "approved" && (
                    <span className="bg-green-600 px-1 text-white">Approved</span>
                  )}
                </p>
              </div>

              {/* User Dropdown */}
              <div className="flex items-center relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex text-sm ring-1 ring-blue-500 rounded-full focus:ring-2 focus:ring-blue-300"
                >
                  <Image
                    className="w-8 h-8 rounded-full"
                    src="/default-avatar.png"
                    alt={user.name}
                    width={32}
                    height={32}
                  />
                </button>
                
                {showDropdown && (
                  <div className="z-50 absolute top-12 right-0 bg-white shadow-lg rounded-lg w-48 overflow-hidden">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <ul className="py-1">
                      {user.isGISRegistered && (
                        <li>
                          <Link
                            href="/gis/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowDropdown(false)}
                          >
                            Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          href={getProfileLink()}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowDropdown(false)}
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/account/login"
              className="font-semibold px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;