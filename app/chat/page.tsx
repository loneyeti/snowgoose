import { redirect } from "next/navigation";
import ChatWrapper from "../_ui/chat/chat-wrapper";
import { createClient } from "../_utils/supabase/server";
import {
  getGlobalPersonas,
  getUserPersonas,
} from "../_lib/server_actions/persona.actions";
import { getModels } from "../_lib/server_actions/model.actions";
import { getOutputFormats } from "../_lib/server_actions/output-format.actions";
import { getMcpTools } from "../_lib/server_actions/mcp-tool.actions";
import { getApiVendors } from "../_lib/server_actions/api_vendor.actions";
import { getCurrentAPIUser } from "../_lib/auth";
import { SubscriptionPlanRepository } from "../_lib/db/repositories/subscription-plan.repository";
import { SubscriptionPlan, Prisma } from "@prisma/client"; // Import Prisma namespace
import { Logger } from "next-axiom";

// Instantiate repositories needed on the page
const subscriptionPlanRepo = new SubscriptionPlanRepository();

// Define the expected type for Model including the vendor relation
type ModelWithVendor = Prisma.ModelGetPayload<{
  include: {
    apiVendor: true;
  };
}>;

export default async function Home() {
  const supabase = await createClient();

  //const { data, error } = await supabase.auth.getUser();
  const user = await getCurrentAPIUser();
  if (!user) {
    redirect("/login");
  }

  const log = new Logger({ source: "chat-home" }).with({ userId: user.id });

  const [
    userPersonas,
    globalPersonas,
    models, // Initially fetched models
    outputFormats,
    mcpTools,
    apiVendors,
  ] = await Promise.all([
    getUserPersonas(user),
    getGlobalPersonas(),
    getModels(), // Fetches models including apiVendor relation
    getOutputFormats(),
    getMcpTools(),
    getApiVendors(), // Fetches vendors separately (though included in models)
  ]);

  // Explicitly type the fetched models
  const typedModels: ModelWithVendor[] = models as ModelWithVendor[];

  // Add vendor name directly to model objects for reliable serialization
  const modelsWithVendorName = typedModels.map((model) => ({
    ...model,
    // Use the included apiVendor object if available, otherwise mark as Unknown
    apiVendorName: model.apiVendor?.name || "Unknown Vendor",
  }));

  return (
    <main>
      <div className="">
        <ChatWrapper
          userPersonas={userPersonas}
          globalPersonas={globalPersonas}
          models={modelsWithVendorName} // Pass the modified array
          outputFormats={outputFormats}
          mcpTools={mcpTools}
          apiVendors={apiVendors} // Keep passing original vendors if needed elsewhere
          user={user}
          creditBalance={user.creditBalance ?? 0.0}
        />
      </div>
    </main>
  );
}
