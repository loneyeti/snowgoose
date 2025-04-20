"use client";

import "../marketing.css"; // Import marketing styles specifically for this layout
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"; // Import icons for mobile menu
import { createClient } from "@/app/_utils/supabase/client"; // Import client-side Supabase client
import { User } from "@supabase/supabase-js"; // Import User type
import { useLogger } from "next-axiom";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const supabase = createClient();
  const log = useLogger();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setUser(data.user);
      } else {
        log.error(`Error fetching user ${error.message}`); // Log error for debugging
      }
      setLoading(false);
    };
    fetchUser();

    // Optional: Listen for auth state changes if needed for real-time updates
    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //   (_event, session) => {
    //     setUser(session?.user ?? null);
    //     setLoading(false); // Update loading state on change too
    //   }
    // );

    // return () => {
    //   authListener?.subscription.unsubscribe();
    // };
  }, [supabase.auth]); // Dependency array includes supabase.auth

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {" "}
      {/* Base dark theme */}
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/80 backdrop-blur">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/snowgoose-logo-spring-2025-white-transparent.png"
              alt="Snowgoose Logo"
              width={32} // Slightly smaller for nav
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">Snowgoose</span>
          </Link>
          {/* Desktop Menu Links - Hidden on small screens */}
          <div className="hidden md:flex items-center space-x-4 md:space-x-6">
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
            <Link
              href="/blog" // Added Blog link
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="https://docs.snowgoose.app"
              target="_blank" // Open in new tab
              rel="noopener noreferrer" // Security best practice for target="_blank"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Docs
            </Link>
            {/* Auth buttons for Desktop */}
            {loading ? (
              <div className="flex items-center space-x-4">
                {/* Placeholder for loading state */}
                <div className="h-5 w-12 animate-pulse rounded bg-gray-700"></div>
                <div className="h-8 w-20 animate-pulse rounded-md bg-gray-700"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* Links for logged-in users */}
                <Link
                  href="/chat"
                  className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Go to App
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Links for logged-out users */}
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/login?signup=true" // Generic signup indicator, login page should handle this
                  className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Hidden on medium screens and up */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu - Conditionally rendered inside nav */}
          {isMobileMenuOpen && (
            <div
              className="md:hidden absolute top-full left-0 w-full bg-gray-800 border-t border-gray-700"
              id="mobile-menu"
            >
              <div className="space-y-1 px-2 pb-3 pt-2">
                <Link
                  href="/"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                >
                  Home
                </Link>
                <Link
                  href="/features"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="https://docs.snowgoose.app"
                  target="_blank" // Open in new tab
                  rel="noopener noreferrer" // Security best practice for target="_blank"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                >
                  Docs
                </Link>
              </div>
              {/* Mobile Auth Buttons */}
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="space-y-1 px-2">
                  {loading ? (
                    <>
                      {/* Placeholder for loading state */}
                      <div className="block h-5 w-16 animate-pulse rounded bg-gray-700 mb-2"></div>
                      <div className="block h-8 w-24 animate-pulse rounded-md bg-gray-700"></div>
                    </>
                  ) : user ? (
                    <>
                      {/* Links for logged-in users */}
                      <Link
                        href="/chat"
                        className="block rounded-md bg-indigo-500 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Go to App
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Links for logged-out users */}
                      <Link
                        href="/login"
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/login?signup=true"
                        className="block rounded-md bg-indigo-500 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
      {/* Page Content */}
      <main className="flex-grow">{children}</main>
      {/* Footer */}
      <footer className="py-8 border-t border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span>
            &copy; {new Date().getFullYear()} Snowgoose. All rights reserved.
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>{" "}
          {/* Separator for wider screens */}
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <span className="hidden sm:inline text-gray-600">|</span>{" "}
          {/* Separator */}
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
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
        /* Body style removed to prevent leaking into other app sections */
      `}</style>
    </div>
  );
}
