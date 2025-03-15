import { getModels } from "@/app/_lib/server_actions/model.actions";
import { Model } from "@prisma/client";

export async function ModelSelect({
  defaultValue,
}: {
  defaultValue?: string | number;
}) {
  const models = await getModels();
  console.log(models);
  let selectDefault = "";
  if (!defaultValue) {
    console.log("No default value");
    selectDefault = `$models[0].id}`;
  } else {
    selectDefault = `${defaultValue}`;
  }
  console.log(selectDefault);

  return (
    <select
      name="summaryModelPreferenceId"
      defaultValue={selectDefault}
      className="block w-full mt-0 px-3 text-sm border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-gray-400 rounded-md disabled:bg-slate-200 disabled:text-slate-500"
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
