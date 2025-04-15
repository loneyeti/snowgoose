import {
  getUserSettingsByUserId,
  updateUserSettings,
} from "@/app/_lib/server_actions/user-settings.actions";
import { ModelSelect } from "./model-select";
import { Suspense } from "react";
import { getUserID } from "@/app/_lib/auth";

export default async function UserSettingsForm() {
  const userId = await getUserID();
  const settings = await getUserSettingsByUserId(userId);

  return (
    <main>
      <form action={updateUserSettings}>
        <div className="w-2/3 flex justify-center flex-col">
          <input type="hidden" name="id" value={settings?.id} />
          <input type="hidden" name="user_id" value={settings?.userId} />
          {/* Appearance Mode */}
          <div className="py-2">
            {/* Dark mode: Adjust label color */}
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="appearance_mode"
            >
              Appearance Mode
            </label>
            {/* Dark mode: Adjust select styles */}
            <select
              name="appearanceMode"
              defaultValue={settings?.appearanceMode}
              className="block w-full mt-0 px-3 text-sm border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-gray-400 dark:focus:border-blue-500 rounded-md disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Summary Model Preference */}
          <div className="py-2">
            {/* Dark mode: Adjust label color */}
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="api_vendor_id"
            >
              Summary Model Preference
            </label>
            <Suspense>
              {/* ModelSelect will inherit dark mode styles from its internal select */}
              <ModelSelect
                defaultValue={`${settings?.summaryModelPreferenceId}`}
              />
            </Suspense>
          </div>

          {/* Submit Button */}
          <div className="py-2">
            {/* Dark mode: Use generic Button component */}
            <Button variant="secondary" type="submit">
              Update Settings
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
// Need to import Button
import { Button } from "@/app/_ui/button";
