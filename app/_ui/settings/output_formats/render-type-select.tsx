import { getRenderTypes } from "@/app/_lib/server_actions/render-type.actions";
import { RenderType } from "@/app/_lib/model";

export default async function RenderTypeSelect({
  defaultValue,
}: {
  defaultValue?: string | number;
}) {
  const renderTypes = await getRenderTypes();
  let selectDefault = "";
  if (!defaultValue) {
    selectDefault = `${renderTypes[0].id}`;
  } else {
    selectDefault = `${defaultValue}`;
  }

  return (
    <select
      name="render_type_id"
      defaultValue={selectDefault}
      className="block w-full mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-600 dark:focus:border-sky-600 rounded-md shadow-sm disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400"
    >
      {renderTypes.map((renderType: RenderType) => {
        return (
          <option value={renderType.id} key={renderType.id}>
            {renderType.name}
          </option>
        );
      })}
    </select>
  );
}
