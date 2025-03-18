"use client";

import { requestPasswordReset } from "@/app/login/actions";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (formData: FormData) => {
    setError(null);
    const result = await requestPasswordReset(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-semibold text-gray-800">
          Reset Password
        </h2>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              If an account exists with this email, you will receive a password
              reset link.
            </div>
            <Link
              href="/login"
              className="block text-center text-blue-600 hover:text-blue-800"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form className="space-y-6" action={handleResetRequest}>
            <div className="flex flex-col">
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

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send Reset Link
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
