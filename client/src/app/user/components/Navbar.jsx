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
});

const ProfileNavbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const isAuth = cookies.get("is_auth");
        if (!isAuth) {
          setUser(null);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/user/me`, {
          withCredentials: true,
        });

        if (!response.data.user) {
          throw new Error("User data not found");
        }

        const userData = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        cookies.remove("is_auth", { path: "/" });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/logout`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        cookies.remove("accessToken", { path: "/" });
        cookies.remove("refreshToken", { path: "/" });
        cookies.remove("is_auth", { path: "/" });
        setUser(null);
        toast.success("Logged out successfully");
        window.location.href = "/account/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-[2000] bg-white shadow-sm">
      <div className="flex justify-end items-center p-4">
        {loading ? (
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full animate-pulse bg-gray-300"></div>
            <div className="flex flex-col min-w-[100px] gap-1">
              <div className="h-2 animate-pulse bg-gray-300 min-w-full rounded-2xl"></div>
              <div className="h-2 max-w-[80%] animate-pulse bg-gray-300 rounded-2xl"></div>
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center relative">
            {/* User Profile Button */}
            <button
              type="button"
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
              <Image
                className="w-8 h-8 rounded-full border border-gray-200"
                src="/default-avatar.png"
                alt={user.name}
                width={32}
                height={32}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      View Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default ProfileNavbar;