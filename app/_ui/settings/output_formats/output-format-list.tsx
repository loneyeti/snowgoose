import { getOutputFormats } from "@/app/_lib/server_actions/output-format.actions";
import { OutputFormat } from "@/app/_lib/model";
import { DeleteOutputFormatButton, EditOutputFormatButton } from "../buttons";

export default async function OutputFormatList() {
  const outputFormats = await getOutputFormats();

  return (
    <>
      {outputFormats.map((outputFormat: OutputFormat) => {
        return (
          // Dark mode: Adjust card background
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50 dark:bg-slate-800"
            key={outputFormat.id}
          >
            {/* Dark mode: Adjust text colors */}
            <h2 className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100">
              {outputFormat.name}
            </h2>
            <h5 className="text-xs mb-4 text-slate-600 dark:text-slate-400 italic">
              Render Type: {outputFormat.render_type_name}
            </h5>
            <p className="text-xs ml-6 text-slate-600 dark:text-slate-400">
              {outputFormat.prompt}
            </p>
            {/* Buttons are already updated via factory */}
            <DeleteOutputFormatButton id={`${outputFormat.id}`} />
            <EditOutputFormatButton id={`${outputFormat.id}`} />
          </div>
        );
      })}
    </>
  );
}
