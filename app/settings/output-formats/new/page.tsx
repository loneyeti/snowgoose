import { SettingsHeading } from "@/app/_ui/typography";
import { createOutputFormat } from "@/app/_lib/api";

export default function NewOutputFormat() {
  return (
    <main>
      <SettingsHeading>New Output Format</SettingsHeading>
      <form action={createOutputFormat}>
        <div className="w-2/3 flex justify-center flex-col">
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
            <label className="text-gray-700 text-xs" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              name="prompt"
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></textarea>
          </div>
          <div className="py-2">
            <button
              className="rounded-md bg-slate-200 p-2 hover:bg-slate-300"
              type="submit"
            >
              Add Output Format
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
