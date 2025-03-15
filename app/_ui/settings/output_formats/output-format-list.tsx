import { getOutputFormats } from "@/app/_lib/server_actions/output-format.actions";
import { OutputFormat } from "@/app/_lib/model";
import { DeleteOutputFormatButton, EditOutputFormatButton } from "../buttons";

export default async function OutputFormatList() {
  const outputFormats = await getOutputFormats();

  return (
    <>
      {outputFormats.map((outputFormat: OutputFormat) => {
        return (
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50"
            key={outputFormat.id}
          >
            <h2 className="text-lg font-semibold mb-1">{outputFormat.name}</h2>
            <h5 className="text-xs mb-4 text-slate-600 italic">
              Render Type: {outputFormat.render_type_name}
            </h5>
            <p className="text-xs ml-6 text-slate-600">{outputFormat.prompt}</p>
            <DeleteOutputFormatButton id={`${outputFormat.id}`} />
            <EditOutputFormatButton id={`${outputFormat.id}`} />
          </div>
        );
      })}
    </>
  );
}
