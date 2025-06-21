import { SettingsHeading } from "@/app/_ui/typography";
import { createMcpTool } from "@/app/_lib/server_actions/mcp-tool.actions";
import { Button } from "@/app/_ui/button";

export default async function NewMCPTool() {
  return (
    <main>
      <SettingsHeading>New MCP Tool</SettingsHeading>
      <form action={createMcpTool}>
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
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></input>
          </div>
          <div className="py-2">
            <Button variant="secondary" type="submit">
              Add MCP Tool
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
