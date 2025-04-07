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
import { SubscriptionPlanRepository } from "./_lib/db/repositories/subscription-plan.repository"; // Import repo
import { SubscriptionPlan } from "@prisma/client"; // Import type

// Instantiate repositories needed on the page
const subscriptionPlanRepo = new SubscriptionPlanRepository();

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
      console.error("Failed to fetch subscription plan on page load:", error);
      // Decide how to handle error - maybe show a generic error or allow usage?
      // For now, we'll default to not limiting usage if the check fails.
      isOverLimit = false;
    }
  }
  // --- End Usage Limit Status Calculation ---

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
          // Pass usage limit props
          periodUsage={user.periodUsage}
          usageLimit={usageLimit}
          isOverLimit={isOverLimit}
        />
      </div>
    </main>
  );
}
