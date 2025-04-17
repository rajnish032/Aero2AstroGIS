"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar({ toggleTheme, theme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items array
  const navItems = [
    { name: "Home", href: "https://www.aero2astro.com/" },
    { name: "About", href: "/about" },
    { name: "Partners", href: "/partners" },
    { name: "FAQ's", href: "/FAQ" },
    { name: "Profile", href: "/user/profile" },
  ];

  return (
    <nav className="w-full px-4 py-3 mx-auto bg-gray-800/80 backdrop-blur-lg sticky top-0 z-[9999] shadow-lg lg:px-8 transition-all duration-300">
      <div className="container flex items-center justify-between mx-auto">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/Logo_Png-09_sifemw.png"
            alt="Aero2Astro Logo"
            width={150}
            height={48}
            className="h-10 w-auto sm:h-12 transition-transform duration-300 hover:scale-105"
            priority
          />
        </Link>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="relative p-2 rounded-lg text-primary hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 min-h-screen w-72 bg-gray-800/95 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:hidden z-50`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link href="/">
              <Image
                src="/Logo_Png-09_sifemw.png"
                alt="Aero2Astro Logo"
                width={120}
                height={40}
                className="h-10 w-auto transition-transform duration-300 hover:scale-105"
                priority
              />
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-primary hover:text-red-500 transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="flex flex-col gap-4 p-6">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`block py-2 px-4 text-lg font-medium ${
                    pathname === item.href
                      ? "text-primary bg-gray-700/50"
                      : "text-white hover:text-blue-300 hover:bg-gray-700/50"
                  } rounded-lg transition-all duration-200`}
                  onClick={toggleMobileMenu}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="mt-4">
              <Link
                href="/account/login"
                className="block w-full text-center bg-primary hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          <ul className="flex items-center gap-6">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`text-lg font-medium relative group ${
                    pathname === item.href ? "text-primary" : "text-white hover:text-blue-300"
                  } transition-colors duration-200`}
                >
                  {item.name}
                  <span
                    className={`absolute left-0 bottom-0 h-0.5 bg-primary transition-all duration-300 ${
                      pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/account/login"
            className="bg-primary hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
          >
            Login
          </Link>
          {/* Theme Toggle Button
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-primary transition-colors duration-200"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button> */}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        ></div>
      )}
    </nav>
  );
}
