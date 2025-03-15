import { SettingsHeading } from "@/app/_ui/typography";
import { updateOutputFormat } from "@/app/_lib/server_actions/output-format.actions";
import { OutputFormat } from "@/app/_lib/model";
import RenderTypeSelect from "./render-type-select";
import { Suspense } from "react";

export default function EditOutputFormatForm({
  outputFormat,
}: {
  outputFormat: OutputFormat;
}) {
  console.log(outputFormat);
  return (
    <main>
      <SettingsHeading>New Persona</SettingsHeading>
      <form action={updateOutputFormat}>
        <input type="hidden" name="id" value={outputFormat.id} />
        <div className="w-2/3 flex justify-center flex-col">
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="render_type_id">
              Render Type
            </label>
            <Suspense>
              <RenderTypeSelect defaultValue={outputFormat.render_type_id} />
            </Suspense>
            <label className="text-gray-700 text-xs" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={outputFormat.name}
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              name="prompt"
              defaultValue={outputFormat.prompt}
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></textarea>
          </div>
          <div className="py-2">
            <button
              className="rounded-md bg-slate-200 p-2 hover:bg-slate-300"
              type="submit"
            >
              Update Output Format
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
