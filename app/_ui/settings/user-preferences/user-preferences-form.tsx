import {
  getUserSettingsByUserId,
  updateUserSettings,
} from "@/app/_lib/server_actions/user-settings.actions";
import { ModelSelect } from "./model-select";
import { Suspense } from "react";
import { getUserID } from "@/app/_lib/auth";
import { Button } from "@/app/_ui/button"; // Moved import to top

export default async function UserSettingsForm() {
  const userId = await getUserID();
  const settings = await getUserSettingsByUserId(userId);

  // Removed redundant <main> tag
  return (
    // Wrapped form content in a consistent card style
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 p-6">
      <form action={updateUserSettings} className="space-y-4">
        {" "}
        {/* Added spacing between form elements */}
        <input type="hidden" name="id" value={settings?.id} />
        <input type="hidden" name="user_id" value={settings?.userId} />
        {/* Appearance Mode */}
        <div>
          {" "}
          {/* Removed py-2, using space-y-4 on form */}
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" // Adjusted label style
            htmlFor="appearance_mode"
          >
            Appearance Mode
          </label>
          {/* Dark mode: Adjust select styles */}
          <select
            id="appearance_mode" // Added id for label association
            name="appearanceMode"
            defaultValue={settings?.appearanceMode}
            className="block w-full mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-600 dark:focus:border-sky-600 rounded-md shadow-sm disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400" // Updated select styling
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        {/* Summary Model Preference */}
        <div>
          {" "}
          {/* Removed py-2 */}
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" // Adjusted label style
            htmlFor="summary_model_preference_id" // Changed htmlFor to match ModelSelect's likely name/id
          >
            Summary Model Preference
          </label>
          <Suspense
            fallback={
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            }
          >
            {" "}
            {/* Simple skeleton */}
            {/* ModelSelect will inherit dark mode styles from its internal select */}
            <ModelSelect
              name="summaryModelPreferenceId" // Ensure name matches hidden input if needed by action
              id="summary_model_preference_id" // Added id
              defaultValue={`${settings?.summaryModelPreferenceId}`}
            />
          </Suspense>
        </div>
        {/* Submit Button */}
        <div className="pt-2">
          {" "}
          {/* Added slight top padding */}
          {/* Dark mode: Use generic Button component */}
          <Button variant="secondary" type="submit">
            Update Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
// Need to import Button
// import { Button } from "@/app/_ui/button"; // Removed from bottom
