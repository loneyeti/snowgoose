import { getMcpTools } from "@/app/_lib/server_actions/mcp-tool.actions";
import { MCPTool } from "@/app/_lib/model";
import { DeleteMCPToolButton, EditMCPToolButton } from "../buttons";

export default async function MCPToolList() {
  const mcpTools = await getMcpTools();

  return (
    <>
      {mcpTools.map((mcpTool: MCPTool) => {
        return (
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50"
            key={mcpTool.id}
          >
            <h2 className="text-lg font-semibold mb-3">{mcpTool.name}</h2>
            <p className="text-xs ml-6 text-slate-600">{mcpTool.path}</p>
            <DeleteMCPToolButton id={`${mcpTool.id}`} />
            <EditMCPToolButton id={`${mcpTool.id}`} />
          </div>
        );
      })}
    </>
  );
}
