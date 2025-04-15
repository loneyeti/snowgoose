import { getModels } from "@/app/_lib/server_actions/model.actions";
import { Model } from "@prisma/client";

export async function ModelSelect({
  defaultValue,
}: {
  defaultValue?: string | number;
}) {
  const models = await getModels();
  let selectDefault = "";
  if (!defaultValue) {
    selectDefault = `$models[0].id}`;
  } else {
    selectDefault = `${defaultValue}`;
  }

  return (
    // Dark mode: Adjust select styles (similar to UserSettingsForm)
    <select
      name="summaryModelPreferenceId"
      defaultValue={selectDefault}
      className="block w-full mt-0 px-3 text-sm border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-gray-400 dark:focus:border-blue-500 rounded-md disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400"
    >
      {models.map((model: Model) => {
        return (
          <option value={model.id} key={model.id}>
            {model.name}
          </option>
        );
      })}
    </select>
  );
}
