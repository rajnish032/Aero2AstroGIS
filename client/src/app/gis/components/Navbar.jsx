"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "antd";
import axios from "axios";
import Cookies from "universal-cookie";
import toast from "react-hot-toast";

const cookies = new Cookies(null, {
  path: "/",
  sameSite: "lax",
});

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Navbar cookies:", cookies.getAll());

        const isAuth = cookies.get("is_auth");
        if (!isAuth) {
          console.log("No auth cookie found");
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
          isGISRegistered: response.data.user.isGISRegistered || false,
          status: response.data.user.status || "pending",
          roles: response.data.user.roles || ["user"],
          isApplied: response.data.user.isApplied || false,
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user in Navbar:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setUser(null);
        cookies.remove("is_auth", { path: "/" });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Apply for approval
  const handleApplyForApproval = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/apply-approval`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setUser((prev) => ({
          ...prev,
          isApplied: true,
          status: "review",
        }));
        toast.success("Application submitted for approval!");
      }
    } catch (error) {
      console.error("Apply for approval error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const message = error.response?.data?.message || "Failed to apply for approval";
      toast.error(message);
    }
  };

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
      console.error("Logout error:", error.response?.data);
      toast.error("Failed to log out");
    }
  };

  // Determine profile link based on user state
  const getProfileLink = () => {
    if (!user) return "/account/login";
    if (user.isGISRegistered) return "/gis/profile";
    return "/account/profile";
  };

  return (
    <header className="sticky top-0 z-[2000] border-b border-blue-400 mb-5 shadow-md bg-white text-gray-700">
      <div className="max-w-screen-xl relative flex flex-wrap items-center justify-between px-3 lg:px-5">
        {/* Logo */}
        <Link
          href={"/"}
          className="lg:mx-20 bg-cover cursor-pointer inline-flex overflow-hidden relative md:w-[300px] h-16 w-[150px] items-center"
        >
          <Image
            src="/logo.png"
            alt="Aero2Astro"
            width={150}
            height={50}
            className="max-sm:scale-[1.4] lg:scale-[1.1]"
          />
        </Link>

        {/* Navigation */}
        <div className="gap-3 flex text-sm lg:mx-4 lg:justify-end flex-grow items-center max-md:hidden">
          {user && (
            <Link
              className="font-semibold px-2 hover:text-blue-400"
              href={getProfileLink()}
            >
              {user.isGISRegistered ? "GIS Profile" : "Complete Profile"}
            </Link>
          )}
          {user?.isGISRegistered && (
            <Link
              className="font-semibold px-2 hover:text-blue-500"
              href={"/gis/dashboard"}
            >
              Dashboard
            </Link>
          )}
          {user && !user.isApplied && (
            <button
              className="font-semibold relative text-white py-1 px-2 rounded hover:bg-blue-600 bg-blue-500"
              onClick={handleApplyForApproval}
            >
              Apply for Approval
            </button>
          )}
        </div>

        {/* User Info and Dropdown */}
        <div className="items-center flex md:flex-row-reverse gap-5 relative">
          {loading ? (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full animate-pulse bg-gray-500"></div>
              <div className="flex flex-col min-w-[100px] gap-1">
                <div className="h-2 animate-pulse bg-gray-800 min-w-full rounded-2xl"></div>
                <div className="h-2 max-w-[80%] animate-pulse bg-gray-800 rounded-2xl"></div>
                <div className="h-2 max-w-[70%] animate-pulse bg-gray-800 rounded-2xl"></div>
              </div>
            </div>
          ) : user ? (
            <>
              <div className="w-fit py-2">
                <p className="font-semibold max-sm:text-sm">{user.name}</p>
                <p className="text-xs">{user.roles[0]}</p>
                <p className="text-xs mt-1">
                  {user.status === "pending" ? (
                    <span className="bg-red-600 px-1 text-center w-fit text-white">
                      Not Applied
                    </span>
                  ) : user.status === "review" ? (
                    <span className="bg-yellow-600 text-center w-fit px-1 text-white">
                      Review
                    </span>
                  ) : user.status === "rejected" ? (
                    <span className="bg-red-600 text-center w-fit px-1 text-white">
                      Rejected
                    </span>
                  ) : user.status === "approved" ? (
                    <span className="bg-green-600 text-center w-fit px-1 text-white">
                      Approved
                    </span>
                  ) : null}
                </p>
              </div>

              {/* User Dropdown */}
              <div className="flex items-center relative md:order-2 space-x-3 md:space-x-0">
                <button
                  type="button"
                  className="flex text-sm ring-1 ring-blue-500 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="sr-only">Open user menu</span>
                  <Image
                    className="w-8 h-8 rounded-full"
                    src="/default-avatar.png"
                    alt={user.name}
                    width={32}
                    height={32}
                  />
                </button>
                {showDropdown && (
                  <div className="z-50 my-4 text-base fixed top-16 right-5 lg:right-52 list-none shadow-lg bg-white divide-y divide-gray-500 rounded-lg">
                    <div className="px-4 py-3">
                      <span className="block text-sm text-gray-900">
                        {user.name?.toUpperCase()}
                      </span>
                      <span className="block text-sm text-gray-900 truncate">
                        {user.email}
                      </span>
                    </div>
                    <ul className="py-2">
                      {user.isGISRegistered && (
                        <li>
                          <Link
                            href="/gis/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            GIS Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          href={getProfileLink()}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {user.isGISRegistered ? "GIS Profile" : "My Profile"}
                        </Link>
                      </li>
                      {!user.isApplied && (
                        <li>
                          <Button
                            onClick={handleApplyForApproval}
                            className="block px-4 text-sm bg-green-500 font-semibold text-white mx-auto w-[90%] hover:bg-green-600"
                          >
                            Apply for Approval
                          </Button>
                        </li>
                      )}
                      <li>
                        <Button
                          onClick={handleLogout}
                          className="block px-4 text-sm bg-blue-500 font-bold text-white w-[90%] mx-auto my-2 hover:bg-blue-600"
                        >
                          Sign out
                        </Button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/account/login"
              className="font-semibold px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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