import {
  getGlobalSettings,
  updateGlobalSettings,
} from "@/app/_lib/server_actions/global-settings.actions";
import { ModelSelect } from "@/app/_ui/settings/user-preferences/model-select";
import { Suspense } from "react";
import { Button } from "@/app/_ui/button";

export default async function DefaultModelForm() {
  const settings = await getGlobalSettings();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 p-6">
      <form action={updateGlobalSettings} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            htmlFor="default_model_id"
          >
            Default Model
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            This model is preselected for every user when they start a new
            chat.
          </p>
          <Suspense
            fallback={
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            }
          >
            <ModelSelect
              name="defaultModelId"
              id="default_model_id"
              defaultValue={settings?.defaultModelId ?? undefined}
            />
          </Suspense>
        </div>
        <div className="pt-2">
          <Button variant="secondary" type="submit">
            Update Default Model
          </Button>
        </div>
      </form>
    </div>
  );
}
