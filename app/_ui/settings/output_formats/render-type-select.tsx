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
      className="block w-full mt-0 px-3 text-sm border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-gray-400 rounded-md disabled:bg-slate-200 disabled:text-slate-500"
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
