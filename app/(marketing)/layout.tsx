"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {" "}
      {/* Base dark theme */}
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/80 backdrop-blur">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/snowgoose-new-logo.png"
              alt="Snowgoose Logo"
              width={32} // Slightly smaller for nav
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">Snowgoose</span>
          </Link>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Pricing
            </Link>
            {/* Add Blog, About, Contact links later */}
            <div className="hidden md:flex items-center space-x-4">
              {" "}
              {/* Hide on small screens */}
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/login?plan=basic" // Example link, adjust as needed
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign Up
              </Link>
            </div>
            {/* TODO: Add mobile menu toggle button and functionality */}
          </div>
        </nav>
      </header>
      {/* Page Content */}
      <main className="flex-grow">{children}</main>
      {/* Footer */}
      <footer className="py-8 border-t border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          {/* Add more footer links later if needed */}
          &copy; {new Date().getFullYear()} Snowgoose. All rights reserved.
        </div>
      </footer>
      {/* Gradient Animation Style - applied globally via layout */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 5s ease infinite;
        }
        /* Ensure body background matches layout for seamless look */
        body {
          background-color: #111827; /* bg-gray-900 */
        }
      `}</style>
    </div>
  );
}
