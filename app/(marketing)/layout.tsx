"use client";

import "../marketing.css"; // Import marketing styles specifically for this layout
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
              src="/snowgoose-logo-2025-white.png"
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
              {loading ? (
                <>
                  {/* Placeholder for loading state */}
                  <div className="h-5 w-12 animate-pulse rounded bg-gray-700"></div>
                  <div className="h-8 w-20 animate-pulse rounded-md bg-gray-700"></div>
                </>
              ) : user ? (
                <>
                  {/* Links for logged-in users */}
                  <Link
                    href="/chat"
                    className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Go to App
                  </Link>
                  {/* Optional: Add Sign Out button here if needed in marketing layout */}
                  {/* <form action="/auth/signout" method="post">
                    <button type="submit" className="text-sm font-medium text-gray-300 hover:text-white">
                      Sign Out
                    </button>
                  </form> */}
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            {/* TODO: Add mobile menu toggle button and functionality */}
          </div>
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
