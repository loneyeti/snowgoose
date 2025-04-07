import { SettingsHeading } from "@/app/_ui/typography";
import { createModel } from "@/app/_lib/server_actions/model.actions";
import { Suspense } from "react";
import { APIVendorSelect } from "@/app/_ui/settings/models/api-vendor-select";

export default async function NewModel() {
  return (
    <main>
      <SettingsHeading>New Model</SettingsHeading>
      <form action={createModel}>
        <div className="w-2/3 flex justify-center flex-col">
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="api_name">
              API Name
            </label>
            <input
              type="text"
              name="api_name"
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              name="name"
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="is_vision">
              Is Vision
            </label>
            <input
              type="checkbox"
              name="is_vision"
              className="block mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 text-xs"
              htmlFor="is_image_generation"
            >
              Is Image Generation
            </label>
            <input
              type="checkbox"
              name="is_image_generation"
              className="block mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="is_thinking">
              Is Google Thinking Model
            </label>
            <input
              type="checkbox"
              name="is_thinking"
              className="block mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="input_token_cost">
              Input Token Cost
            </label>
            <input
              type="number"
              step="0.000001"
              name="input_token_cost"
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 text-xs"
              htmlFor="output_token_cost"
            >
              Output Token Cost
            </label>
            <input
              type="number"
              step="0.000001"
              name="output_token_cost"
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="api_vendor_id">
              API Vendor
            </label>
            <Suspense>
              <APIVendorSelect />
            </Suspense>
          </div>
          <div className="py-2">
            <button
              className="rounded-md bg-slate-200 p-2 hover:bg-slate-300"
              type="submit"
            >
              Add Model
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
