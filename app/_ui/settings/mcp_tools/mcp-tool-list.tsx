import { getMcpTools } from "@/app/_lib/server_actions/mcp-tool.actions";
import { MCPTool } from "@/app/_lib/model";
import { DeleteMCPToolButton, EditMCPToolButton } from "../buttons";

export default async function MCPToolList() {
  const mcpTools = await getMcpTools();

  return (
    <>
      {mcpTools.map((mcpTool: MCPTool) => {
        return (
          // Dark mode: Adjust card background
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50 dark:bg-slate-800"
            key={mcpTool.id}
          >
            {/* Dark mode: Adjust text colors */}
            <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
              {mcpTool.name}
            </h2>
            <p className="text-xs ml-6 text-slate-600 dark:text-slate-400">
              {mcpTool.path}
            </p>
            {/* Buttons are already updated via factory */}
            <DeleteMCPToolButton id={`${mcpTool.id}`} />
            <EditMCPToolButton id={`${mcpTool.id}`} />
          </div>
        );
      })}
    </>
  );
}
