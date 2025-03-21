import { redirect } from "next/navigation";
import ChatWrapper from "./_ui/chat-wrapper";
import { createClient } from "./_utils/supabase/server";
import { getPersonas } from "./_lib/server_actions/persona.actions";
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

  const [personas, models, outputFormats, mcpTools, apiVendors] =
    await Promise.all([
      getPersonas(),
      getModels(),
      getOutputFormats(),
      getMcpTools(),
      getApiVendors(),
    ]);

  return (
    <main>
      <ChatWrapper
        personas={personas}
        models={models}
        outputFormats={outputFormats}
        mcpTools={mcpTools}
        apiVendors={apiVendors}
        user={user}
      />
    </main>
  );
}
