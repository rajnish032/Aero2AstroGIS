"use client";
import { useState } from "react";
import UserSidebar from "@/components/UserSidebar";
import ProfileNavbar from "./components/Navbar";

const UserLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div 
        className={`bg-gray-100 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } flex-1 `}
      >
        <ProfileNavbar/>
        {children}
      </div>
    </div>
  );
};

export default UserLayout;
