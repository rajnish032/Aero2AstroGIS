"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "antd";
import axios from "axios";
import Cookies from "universal-cookie";
import toast from "react-hot-toast";

const cookies = new Cookies(undefined, {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

const ProfileNavbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Fetch user data with token refresh capability
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try with existing access token
      let response = await axios.get(`${API_BASE_URL}/api/user/me`, {
        withCredentials: true,
      }).catch(err => err.response || err);

      // If unauthorized, try to refresh token
      if (response?.status === 401) {
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/api/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          if (refreshResponse.data?.accessToken) {
            // Retry with new token
            response = await axios.get(`${API_BASE_URL}/api/user/me`, {
              withCredentials: true,
            });
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw new Error("Session expired. Please login again.");
        }
      }

      if (response?.data?.user) {
        setUser({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          roles: response.data.user.roles || ["user"],
          isGISRegistered: response.data.user.isGISRegistered || false,
        });
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError(error.message);
      setUser(null);
      cookies.remove("is_auth", { path: "/" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (e.target.closest('.profile-dropdown') === null) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Logout function with better error handling
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
      toast.error(error.response?.data?.message || "Failed to log out");
      
      // If unauthorized, the token might be expired - clear cookies anyway
      if (error.response?.status === 401) {
        cookies.remove("accessToken", { path: "/" });
        cookies.remove("refreshToken", { path: "/" });
        cookies.remove("is_auth", { path: "/" });
        setUser(null);
        window.location.href = "/account/login";
      }
    }
  };

  // Close dropdown when navigating
  const handleNavigation = () => {
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-[2000] bg-white shadow-sm">
      <div className="flex justify-end items-center p-4">
        {loading ? (
          <div className="flex gap-2 items-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="flex flex-col min-w-[100px] gap-1">
              <div className="h-2 bg-gray-200 min-w-full rounded"></div>
              <div className="h-2 max-w-[80%] bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <Link
            href="/account/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Login
          </Link>
        ) : user ? (
          <div className="flex items-center relative profile-dropdown">
            {/* User Profile Button */}
            <button
              type="button"
              className="flex items-center gap-2 focus:outline-none hover:bg-gray-100 rounded-full p-1 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {user.name}
              </span>
              <Image
                className="w-8 h-8 rounded-full border border-gray-200"
                src="/default-avatar.png"
                alt={user.name}
                width={32}
                height={32}
                priority
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={handleNavigation}
                    >
                      View Profile
                    </Link>
                  </li>
                  {user.isGISRegistered && (
                    <li>
                      <Link
                        href="/gis/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={handleNavigation}
                      >
                        GIS Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/account/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default ProfileNavbar;