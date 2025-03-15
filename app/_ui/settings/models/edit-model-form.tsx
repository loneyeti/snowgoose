import { SettingsHeading } from "@/app/_ui/typography";
import { updateModel } from "@/app/_lib/server_actions/model.actions";
import { Model } from "@prisma/client";
import { APIVendorSelect } from "./api-vendor-select";
import { Suspense } from "react";

export default function EditModelForm({ model }: { model: Model }) {
  console.log(model);
  return (
    <main>
      <SettingsHeading>Edit Model</SettingsHeading>
      <form action={updateModel}>
        <input type="hidden" name="id" value={model.id} />
        <div className="w-2/3 flex justify-center flex-col">
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="api_name">
              API Name
            </label>
            <input
              type="text"
              name="api_name"
              defaultValue={model.apiName}
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
              defaultValue={model.name}
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
              defaultChecked={model.isVision}
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
              defaultChecked={model.isImageGeneration}
              className="block mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="is_thinkingn">
              Is Thinking
            </label>
            <input
              type="checkbox"
              name="is_thinking"
              defaultChecked={model.isThinking}
              className="block mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="api_vendor_id">
              API Vendor
            </label>
            <Suspense>
              <APIVendorSelect defaultValue={`${model.apiVendorId}`} />
            </Suspense>
          </div>
          <div className="py-2">
            <button
              className="rounded-md bg-slate-200 p-2 hover:bg-slate-300"
              type="submit"
            >
              Update Model
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
