import { getApiVendors } from "@/app/_lib/server_actions/api_vendor.actions";
//import { APIVendor } from "@/app/_lib/model";
import { APIVendor } from "@prisma/client";

export async function APIVendorSelect({
  defaultValue,
}: {
  defaultValue?: string | number;
}) {
  const apiVendors = await getApiVendors();
  console.log(apiVendors);
  let selectDefault = "";
  if (!defaultValue) {
    console.log("No default value");
    selectDefault = `${apiVendors[0].id}`;
  } else {
    selectDefault = `${defaultValue}`;
  }
  console.log(selectDefault);

  return (
    <select
      name="api_vendor_id"
      defaultValue={selectDefault}
      className="block w-full mt-0 px-3 text-sm border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-gray-400 rounded-md disabled:bg-slate-200 disabled:text-slate-500"
    >
      {apiVendors.map((apiVendor: APIVendor) => {
        return (
          <option value={apiVendor.id} key={apiVendor.id}>
            {apiVendor.name}
          </option>
        );
      })}
    </select>
  );
}
