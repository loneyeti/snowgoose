import { fetchMCPTool } from "@/app/_lib/api";
import EditMCPToolForm from "@/app/_ui/settings/mcp_tools/edit-mcp-tool-form";
import { notFound } from "next/navigation";

export default async function EditMCPTool({
  params,
}: {
  params: { id: string };
}) {
  const mcpTool = await fetchMCPTool(params.id);
  if (!mcpTool) {
    return notFound();
  }
  return <EditMCPToolForm mcpTool={mcpTool} />;
}
