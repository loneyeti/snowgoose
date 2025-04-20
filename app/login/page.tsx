"use client";

import { login } from "./actions"; // Removed signup import
import { useState, useEffect, Suspense } from "react";
// Link import removed as 'Forgot password?' is deleted
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/client";
import { FaGithub, FaGoogle } from "react-icons/fa"; // Import GitHub and Google icons

// Separate component to handle URL params
function LoginForm() {
  const supabase = createClient(); // Initialize Supabase client
  const router = useRouter(); // Initialize router
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
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

  // Client-side form submission wrapper to handle errors and loading state
  const handleLogin = async (formData: FormData) => {
    setError(null); // Clear previous errors
    setIsSubmitting(true); // Set loading state
    console.log("Submitting login form..."); // Add log

    try {
      const result = await login(formData);
      console.log("Login action result:", result); // Log the result

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // Explicitly check for success before setting message
        setError("Check your email! A magic link has been sent to log you in.");
      } else {
        // Handle unexpected result (neither error nor success)
        setError("An unexpected issue occurred. Please try again.");
      }
    } catch (e) {
      console.error("Client-side error during login:", e);
      setError("An unexpected client-side error occurred.");
    } finally {
      setIsSubmitting(false); // Reset loading state regardless of outcome
    }
  };

  // handleSignup function removed

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

  // New onSubmit handler for the form
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("Form onSubmit triggered!"); // Add log here
    event.preventDefault(); // Prevent default browser submission
    const formData = new FormData(event.currentTarget);
    handleLogin(formData); // Call our existing logic
  };

  return (
    // Use a background similar to the chat wrapper's subtle gradient or a light neutral
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      {/* Increase max-width slightly, add more padding, rounded corners, and subtle shadow */}
      <form
        className="w-full max-w-md space-y-6 bg-white p-10 rounded-xl shadow-lg border border-slate-100"
        onSubmit={handleSubmit}
      >
        {/* Slightly larger logo */}
        <img
          src="/snowgoose-logo-spring-2025-black-transparent.png"
          alt="Snowgoose Logo"
          className="mx-auto h-14 mb-6" // Increased size and margin
        />
        {/* Adjusted heading style */}
        <h2 className="text-center text-3xl font-semibold text-slate-800">
          Snowgoose
        </h2>
        <p className="text-center text-sm text-slate-500 mt-1 mb-6">
          Sign in using an email link or your preferred provider.
        </p>

        {/* Error message display - improved styling */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Hidden input to pass the redirect path */}
        <input type="hidden" name="redirect_to" value={redirectTo || ""} />

        {/* Email Input - improved styling */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="block w-full p-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Magic Link Button - Primary action style */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isSubmitting ? "Sending Email Link..." : "Send Email Link"}
          </button>
        </div>

        {/* Divider - subtle styling */}
        <div className="relative my-6">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons Container */}
        <div className="space-y-4">
          {/* Google Sign-In Button - Consistent secondary style */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
            Sign in with Google
          </button>

          {/* GitHub Sign-In Button - Consistent secondary style */}
          <button
            type="button"
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            <FaGithub className="w-5 h-5 mr-3 text-slate-800" />{" "}
            {/* Adjusted icon color */}
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
