import { SettingsHeading } from "@/app/_ui/typography";
import { updateMCPTool } from "@/app/_lib/api";
import { MCPTool } from "@/app/_lib/model";

export default function EditMCPToolForm({ mcpTool }: { mcpTool: MCPTool }) {
  return (
    <main>
      <SettingsHeading>Edit MCP Tool</SettingsHeading>
      <form action={updateMCPTool}>
        <input type="hidden" name="id" value={mcpTool.id} />
        <div className="w-2/3 flex justify-center flex-col">
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={mcpTool.name}
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label className="text-gray-700 text-xs" htmlFor="path">
              Path
            </label>
            <input
              type="text"
              name="path"
              defaultValue={mcpTool.path}
              className="block w-full mt-0 px-3 border border-gray-200 focus:ring-0 focus:border-black rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <button
              className="rounded-md bg-slate-200 p-2 hover:bg-slate-300"
              type="submit"
            >
              Update MCP Tool
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
