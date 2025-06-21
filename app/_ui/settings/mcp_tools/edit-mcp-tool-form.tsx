import { SettingsHeading } from "@/app/_ui/typography";
import { updateMcpTool } from "@/app/_lib/server_actions/mcp-tool.actions";
import { MCPTool } from "@/app/_lib/model";
import { Button } from "@/app/_ui/button";

export default function EditMCPToolForm({ mcpTool }: { mcpTool: MCPTool }) {
  return (
    <main>
      <SettingsHeading>Edit MCP Tool</SettingsHeading>
      <form action={updateMcpTool}>
        <input type="hidden" name="id" value={mcpTool.id} />
        <div className="w-2/3 flex justify-center flex-col">
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
              defaultValue={mcpTool.name}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="path"
            >
              Path
            </label>
            <input
              type="text"
              name="path"
              defaultValue={mcpTool.path}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <Button variant="secondary" type="submit">
              Update MCP Tool
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
