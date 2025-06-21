import { SettingsHeading } from "@/app/_ui/typography";
import { updateModel } from "@/app/_lib/server_actions/model.actions";
import { Model } from "@prisma/client";
import { APIVendorSelect } from "./api-vendor-select";
import { Suspense } from "react";
import { Button } from "@/app/_ui/button";

export default function EditModelForm({ model }: { model: Model }) {
  return (
    <main>
      <SettingsHeading>Edit Model</SettingsHeading>
      <form action={updateModel}>
        <input type="hidden" name="id" value={model.id} />
        <div className="w-2/3 flex justify-center flex-col">
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="api_name"
            >
              API Name
            </label>
            <input
              type="text"
              name="api_name"
              defaultValue={model.apiName}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={model.name}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="is_vision"
            >
              Is Vision
            </label>
            <input
              type="checkbox"
              name="is_vision"
              defaultChecked={model.isVision}
              className="block mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-0 focus:border-black dark:focus:ring-blue-600"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="is_image_generation"
            >
              Is Image Generation
            </label>
            <input
              type="checkbox"
              name="is_image_generation"
              defaultChecked={model.isImageGeneration}
              className="block mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-0 focus:border-black dark:focus:ring-blue-600"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="is_web_search"
            >
              Is Web Search
            </label>
            <input
              type="checkbox"
              name="is_web_search"
              defaultChecked={model.isWebSearch || false}
              className="block mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-0 focus:border-black dark:focus:ring-blue-600"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="is_thinking"
            >
              Is Thinking
            </label>
            <input
              type="checkbox"
              name="is_thinking"
              defaultChecked={model.isThinking}
              className="block mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-0 focus:border-black dark:focus:ring-blue-600"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="input_token_cost"
            >
              Input Token Cost
            </label>
            <input
              type="number"
              step="0.000001"
              name="input_token_cost"
              defaultValue={model.inputTokenCost || undefined}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="output_token_cost"
            >
              Output Token Cost
            </label>
            <input
              type="number"
              step="0.000001"
              name="output_token_cost"
              defaultValue={(model as any).outputTokenCost || undefined}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="image_output_token_cost"
            >
              Image Output Token Cost
            </label>
            <input
              type="number"
              step="0.000001"
              name="image_output_token_cost"
              defaultValue={(model as any).imageOutputTokenCost || undefined}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="web_search_cost"
            >
              Web Search Cost
            </label>
            <input
              type="number"
              step="0.01"
              name="web_search_cost"
              defaultValue={(model as any).webSearchCost || undefined}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="api_vendor_id"
            >
              API Vendor
            </label>
            <Suspense>
              <APIVendorSelect defaultValue={`${model.apiVendorId}`} />
            </Suspense>
          </div>
          <div className="py-2 flex items-center">
            <input
              type="checkbox"
              name="paid_only"
              defaultChecked={model.paidOnly}
              className="mr-2 mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-0 focus:border-black dark:focus:ring-blue-600"
            />
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="paid_only"
            >
              Paid Only (Requires Subscription)
            </label>
          </div>
          <div className="py-2">
            <Button variant="secondary" type="submit">
              Update Model
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
