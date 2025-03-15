import { SettingsHeading } from "@/app/_ui/typography";
import ModelSkeleton from "@/app/_ui/settings/list-skeleton";
import MCPToolList from "@/app/_ui/settings/mcp_tools/mcp-tool-list";
import { Suspense } from "react";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import Link from "next/link";

export default async function MCPTools() {
  return (
    <main>
      <SettingsHeading>MCP Tools</SettingsHeading>
      <div className="flex flex-col justify-center mt-6">
        <Suspense
          fallback={
            <>
              <ModelSkeleton />
              <ModelSkeleton />
              <ModelSkeleton />
            </>
          }
        >
          <MCPToolList />
        </Suspense>
        <Link href="/settings/mcp-tools/new">
          <div className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-200 hover:bg-slate-300">
            <div>
              <p className="text-lg font-semibold">
                <MaterialSymbol
                  icon="add_circle"
                  size={24}
                  className="mr-2 align-middle"
                ></MaterialSymbol>
                Add new
              </p>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
