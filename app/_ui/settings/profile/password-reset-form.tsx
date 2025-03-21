"use client";

import { useFormState } from "react-dom";
import { updateUserPassword } from "@/app/_lib/server_actions/user.actions";
import { FormState } from "@/app/_lib/form-schemas";

export default function PasswordResetForm() {
  const [state, formAction] = useFormState<FormState, FormData>(
    updateUserPassword,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          name="currentPassword"
          required
          className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
        ></input>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={6}
          className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
        ></input>
      </div>

      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

      {state?.success && (
        <p className="text-green-500 text-sm">Password updated successfully!</p>
      )}

      <button type="submit" className="mt-4">
        Update Password
      </button>
    </form>
  );
}
