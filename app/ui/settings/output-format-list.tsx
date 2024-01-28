import { fetchOutputFormats } from "@/app/lib/api";
import { OutputFormat } from "@/app/lib/model";
import { DeleteOutputFormatButton } from "./buttons";

export default async function OutputFormatList() {
  const outputFormats = await fetchOutputFormats();

  return (
    <>
      {outputFormats.map((outputFormat: OutputFormat) => {
        return (
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50"
            key={outputFormat.id}
          >
            <h2 className="text-lg font-semibold mb-3">{outputFormat.name}</h2>
            <p className="text-xs ml-6 text-slate-600">{outputFormat.prompt}</p>
            <DeleteOutputFormatButton id={`${outputFormat.id}`} />
          </div>
        );
      })}
    </>
  );
}
