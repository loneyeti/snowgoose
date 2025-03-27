import { useState, useEffect } from "react";
import { MCPTool } from "@prisma/client";

interface UseMCPToolStateProps {
  mcpTools: MCPTool[];
  initialMCPToolId?: number;
}

export function useMCPToolState({
  mcpTools,
  initialMCPToolId,
}: UseMCPToolStateProps) {
  const [selectedMCPTool, setSelectedMCPTool] = useState<number | undefined>(
    initialMCPToolId !== undefined ? initialMCPToolId : 0
  );

  useEffect(() => {
    if (initialMCPToolId !== undefined) {
      setSelectedMCPTool(initialMCPToolId);
    }
  }, [initialMCPToolId]);

  const updateSelectedMCPTool = (toolId: string | number) => {
    const id = typeof toolId === "string" ? parseInt(toolId) : toolId;
    setSelectedMCPTool(id);
  };

  return {
    selectedMCPTool,
    updateSelectedMCPTool,
  };
}
