import { getApiVendors } from "@/app/_lib/server_actions/api_vendor.actions";
import { APIVendor } from "@prisma/client";

export async function APIVendorSelect({
  defaultValue,
}: {
  defaultValue?: string | number;
}) {
  const apiVendors = await getApiVendors();
  let selectDefault = "";
  if (!defaultValue) {
    selectDefault = `${apiVendors[0].id}`;
  } else {
    selectDefault = `${defaultValue}`;
  }

  return (
    <select
      name="api_vendor_id"
      defaultValue={selectDefault}
      className="block w-full mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-600 dark:focus:border-sky-600 rounded-md shadow-sm disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400"
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
