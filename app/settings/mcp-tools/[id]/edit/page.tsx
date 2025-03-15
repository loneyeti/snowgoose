import { getMcpTool } from "@/app/_lib/server_actions/mcp-tool.actions";
import EditMCPToolForm from "@/app/_ui/settings/mcp_tools/edit-mcp-tool-form";
import { notFound } from "next/navigation";

export default async function EditMCPTool({
  params,
}: {
  params: { id: string };
}) {
  const mcpTool = await getMcpTool(Number(params.id));
  if (!mcpTool) {
    return notFound();
  }
  return <EditMCPToolForm mcpTool={mcpTool} />;
}
