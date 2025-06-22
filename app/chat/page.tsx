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
    // Explicitly remove the nested object if it causes issues, but try keeping it first.
    // apiVendor: undefined, // Optional: Uncomment if serialization issues persist
  }));

  // --- Fetch Subscription Plan and Calculate Usage Limit Status ---
  let plan: SubscriptionPlan | null = null;
  let usageLimit: number | null = null;
  let isOverLimit = false;

  if (user && user.stripePriceId) {
    try {
      plan = await subscriptionPlanRepo.findByStripePriceId(user.stripePriceId);
      if (plan && plan.usageLimit && plan.usageLimit > 0) {
        usageLimit = plan.usageLimit;
        const currentUsage = user.periodUsage ?? 0;
        isOverLimit = currentUsage >= usageLimit;
      }
    } catch (error) {
      log.error(`Failed to fetch subscription plan on page load: ${error}`);
      // Decide how to handle error - maybe show a generic error or allow usage?
      // For now, we'll default to not limiting usage if the check fails.
      isOverLimit = false;
    }
  }
  // --- End Usage Limit Status Calculation ---

  return (
    // Remove bg-slate-50 to inherit background from body in layout
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
          // Pass usage limit props
          periodUsage={user.periodUsage}
          usageLimit={usageLimit}
          isOverLimit={isOverLimit}
        />
      </div>
    </main>
  );
}
