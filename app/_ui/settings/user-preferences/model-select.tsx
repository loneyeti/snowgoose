import { getModels } from "@/app/_lib/server_actions/model.actions";
import { Model } from "@prisma/client";
import { SelectHTMLAttributes } from "react"; // Import necessary type

// Update props to accept standard select attributes including name and id
interface ModelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  defaultValue?: string | number;
}

export async function ModelSelect({
  defaultValue,
  name, // Accept name prop
  id, // Accept id prop
  ...rest // Accept other standard select props
}: ModelSelectProps) {
  const models = await getModels();

  // Corrected default value logic
  let selectDefault = defaultValue
    ? `${defaultValue}`
    : models.length > 0
      ? `${models[0].id}`
      : "";

  return (
    <select
      name={name} // Use passed name
      id={id} // Use passed id
      defaultValue={selectDefault}
      className="block w-full mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-600 dark:focus:border-sky-600 rounded-md shadow-sm disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400" // Updated styling to match user-preferences-form
      {...rest} // Spread other props
    >
      {models.map(
        (
          model: Model // Simplified map return
        ) => (
          <option value={model.id} key={model.id}>
            {model.name}
          </option>
        )
      )}
    </select>
  );
}
