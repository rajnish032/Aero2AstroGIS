"use client";
import { useState } from "react";
import { Home, User, Settings, LogOut, ChevronLeft, ChevronRight, GalleryHorizontalEnd } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLogoutUserMutation } from "@/lib/services/auth";
import Link from "next/link";
import Image from "next/image";


const Sidebar = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutUser] = useLogoutUserMutation();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/user/dashboard" },
    { icon: User, label: "Profile", href: "/user/profile" },
    { icon: GalleryHorizontalEnd, label: "Project", href: "/user/project" },
  ];

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.data?.status === "success") {
        localStorage.removeItem("token");
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={`bg-white fixed left-0 top-0 h-full p-4 flex flex-col gap-8 border-r ${isOpen ? "w-64" : "w-20"} transition-all duration-300`}>
      {/* Header with logo and toggle */}
      <div className="flex items-center justify-between px-2">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <Link href="/">
            <Image
              src="/logo.png" // Your logo path
              alt="Company Logo"
              width={140} // Increased width for better visibility
              height={60} // Adjusted height to maintain aspect ratio
              className="object-contain"
            />
            </Link>
          </div>
        ) : (
          <Link href="/">
          <Image
            src="/icon512_rounded.png"
            alt="Company Logo"
            width={40}
            height={40}
            className="object-contain rounded-full"
          />
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link href={href} key={href} className="group">
            <div
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                pathname === href 
                  ? "bg-blue-50 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={22} className={pathname === href ? "text-blue-500" : "text-gray-500"} />
              {isOpen && (
                <span className={`font-medium ${pathname === href ? "text-blue-600" : "text-gray-700"}`}>
                  {label}
                </span>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* Footer with logout */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <LogOut size={22} className="text-gray-500" />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;