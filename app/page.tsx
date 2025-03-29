import { redirect } from "next/navigation";
import ChatWrapper from "./_ui/chat/chat-wrapper";
import { createClient } from "./_utils/supabase/server";
import {
  getGlobalPersonas,
  getUserPersonas,
} from "./_lib/server_actions/persona.actions";
import { getModels } from "./_lib/server_actions/model.actions";
import { getOutputFormats } from "./_lib/server_actions/output-format.actions";
import { getMcpTools } from "./_lib/server_actions/mcp-tool.actions";
import { getApiVendors } from "./_lib/server_actions/api_vendor.actions";
import { getCurrentAPIUser } from "./_lib/auth";

export default async function Home() {
  const supabase = await createClient();

  //const { data, error } = await supabase.auth.getUser();
  const user = await getCurrentAPIUser();
  if (!user) {
    redirect("/login");
  }

  const [
    userPersonas,
    globalPersonas,
    models,
    outputFormats,
    mcpTools,
    apiVendors,
  ] = await Promise.all([
    getUserPersonas(user),
    getGlobalPersonas(),
    getModels(),
    getOutputFormats(),
    getMcpTools(),
    getApiVendors(),
  ]);

  return (
    <main className="bg-slate-50">
      <div className="">
        <ChatWrapper
          userPersonas={userPersonas}
          globalPersonas={globalPersonas}
          models={models}
          outputFormats={outputFormats}
          mcpTools={mcpTools}
          apiVendors={apiVendors}
          user={user}
        />
      </div>
    </main>
  );
}
