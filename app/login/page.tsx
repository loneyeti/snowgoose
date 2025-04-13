"use client";

import { login, signup } from "./actions";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/client";
import { FaGithub, FaGoogle } from "react-icons/fa"; // Import GitHub and Google icons

// Separate component to handle URL params
function LoginForm() {
  const supabase = createClient(); // Initialize Supabase client
  const router = useRouter(); // Initialize router
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to"); // Get redirect_to param

  // Check for error parameter in URL (query params and hash)
  useEffect(() => {
    let errorMessage: string | null = null;
    // Check query parameters first
    const queryError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description"); // Supabase often uses this

    if (queryError) {
      errorMessage = errorDescription
        ? decodeURIComponent(errorDescription)
        : decodeURIComponent(queryError);
    } else if (window.location.hash) {
      // Check URL fragment (hash) if no query error
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        ); // Remove '#'
        const hashError = hashParams.get("error");
        const hashErrorDescription = hashParams.get("error_description");
        if (hashError) {
          errorMessage = hashErrorDescription
            ? decodeURIComponent(hashErrorDescription)
            : decodeURIComponent(hashError);
        }
      } catch (e) {
        console.warn("Could not parse URL hash:", e);
        // Fallback to raw hash if parsing fails and it looks like an error
        if (window.location.hash.includes("error=")) {
          errorMessage = `An error occurred during login. Details: ${window.location.hash.substring(1)}`;
        }
      }
    }

    if (errorMessage) {
      setError(errorMessage);
      // Optional: Clean the URL to remove the error params after displaying
      // router.replace('/login', undefined); // Or keep params for debugging
    }
  }, [searchParams, router]); // Added router dependency for potential replace usage

  // Nonce generation logic removed

  // Google Sign-In callback logic removed

  // Client-side form submission wrapper to handle errors
  const handleLogin = async (formData: FormData) => {
    setError(null); // Clear previous errors
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  const handleSignup = async (formData: FormData) => {
    setError(null); // Clear previous errors
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  // Handler for GitHub Sign-In
  const signInWithGithub = async () => {
    setError(null); // Clear previous errors
    const redirectUrl = redirectTo || "/chat"; // Default redirect if none provided
    const { error: githubError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        // Point to the callback route, passing the final destination via 'next'
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    if (githubError) {
      console.error("Supabase GitHub Sign-In Error:", githubError);
      setError(`GitHub Sign-In failed: ${githubError.message}`);
    }
    // No need for router.push here, Supabase handles the redirect
  };

  // Handler for Google Sign-In using standard OAuth flow
  const signInWithGoogle = async () => {
    setError(null); // Clear previous errors
    const redirectUrl = redirectTo || "/chat"; // Default redirect if none provided
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Point to the callback route, passing the final destination via 'next'
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
        // Optional: Add scopes if needed, e.g., query_params: { access_type: 'offline', prompt: 'consent' }
      },
    });

    if (googleError) {
      console.error("Supabase Google Sign-In Error:", googleError);
      setError(`Google Sign-In failed: ${googleError.message}`);
    }
    // No need for router.push here, Supabase handles the redirect
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md"
        onSubmit={(e) => e.preventDefault()}
      >
        {" "}
        {/* Prevent default form submission */}
        <img
          src="/snowgoose-logo.png"
          alt="Snowgoose Logo"
          className="mx-auto h-12"
        />
        <h2 className="text-center text-2xl font-semibold text-gray-800 mt-4">
          Welcome Back
        </h2>
        {/* Error message display */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {/* Hidden input to pass the redirect path */}
        <input type="hidden" name="redirect_to" value={redirectTo || ""} />
        <div className="flex flex-col mt-4">
          <label
            htmlFor="email"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col mt-4">
          <label
            htmlFor="password"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Forgot password link */}
        <div className="text-right">
          <Link
            href="/auth/reset-password"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot password?
          </Link>
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            type="submit"
            formAction={handleLogin}
            className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log in
          </button>
          <button
            type="submit"
            formAction={handleSignup}
            className="w-1/2 ml-4 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Sign up
          </button>
        </div>
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        {/* Google Sign-In Button (Custom Style) */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaGoogle className="w-5 h-5 mr-2 text-red-500" />{" "}
            {/* Added Google icon */}
            Sign in with Google
          </button>
        </div>
        {/* GitHub Sign-In Button */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={signInWithGithub}
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaGithub className="w-5 h-5 mr-2" />
            Sign in with GitHub
          </button>
        </div>
      </form>
    </div>
  );
}

// Window interface extension removed

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
