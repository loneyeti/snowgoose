"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { isCurrentUserAdmin } from "@/app/_lib/auth";
import {
  getSubscriptionLimitData,
  upsertSubscriptionPlanAction,
  SubscriptionLimitViewData,
  UpsertSubscriptionPlanState,
} from "@/app/_lib/server_actions/subscription-plan.actions";
import { SettingsHeading } from "@/app/_ui/typography";
import { Button } from "@/app/_ui/button"; // Use the generic Button

// Submit Button Component
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

// Form Component for Editing a Single Plan
function PlanEditForm({ plan }: { plan: SubscriptionLimitViewData }) {
  const initialState: UpsertSubscriptionPlanState = {
    message: null,
    errors: {},
  };
  const [state, dispatch] = useFormState(
    upsertSubscriptionPlanAction,
    initialState
  );
  const [name, setName] = useState(plan.localPlanName || "");
  const [limit, setLimit] = useState(plan.localUsageLimit?.toString() || "");

  useEffect(() => {
    // Reset form fields if the underlying plan data changes (e.g., after save)
    setName(plan.localPlanName || "");
    setLimit(plan.localUsageLimit?.toString() || "");
  }, [plan.localPlanName, plan.localUsageLimit]);

  useEffect(() => {
    // Display success/error messages from form state
    if (state?.message) {
      // Consider using a toast notification library like 'sonner' if available
      alert(state.message); // Simple alert for now
    }
  }, [state]);

  return (
    <form action={dispatch} className="flex items-center space-x-2">
      <input type="hidden" name="stripePriceId" value={plan.stripePriceId} />
      <div className="flex-grow">
        <label htmlFor={`name-${plan.stripePriceId}`} className="sr-only">
          Plan Name
        </label>
        <input
          id={`name-${plan.stripePriceId}`}
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Local Plan Name (e.g., Pro)"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          aria-describedby={`name-error-${plan.stripePriceId}`}
        />
        {state?.errors?.name && (
          <p
            id={`name-error-${plan.stripePriceId}`}
            className="mt-1 text-xs text-red-600"
          >
            {state.errors.name.join(", ")}
          </p>
        )}
      </div>
      <div className="w-24">
        {" "}
        {/* Fixed width for limit input */}
        <label htmlFor={`limit-${plan.stripePriceId}`} className="sr-only">
          Usage Limit
        </label>
        <input
          id={`limit-${plan.stripePriceId}`}
          name="usageLimit"
          type="number"
          step="any" // Allow decimals if needed, or "1" for integers
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Limit"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          aria-describedby={`limit-error-${plan.stripePriceId}`}
        />
        {state?.errors?.usageLimit && (
          <p
            id={`limit-error-${plan.stripePriceId}`}
            className="mt-1 text-xs text-red-600"
          >
            {state.errors.usageLimit.join(", ")}
          </p>
        )}
      </div>
      <SubmitButton />
      {state?.errors?._form && (
        <p className="mt-1 text-xs text-red-600 col-span-full">
          {state.errors._form.join(", ")}
        </p>
      )}
    </form>
  );
}

export default function AdminSubscriptionLimitsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [data, setData] = useState<SubscriptionLimitViewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          router.push("/settings");
          return;
        }

        const fetchedData = await getSubscriptionLimitData();
        setData(fetchedData);
      } catch (err: any) {
        console.error("Error loading admin subscription limits page:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [router]); // Re-run if router changes (though unlikely)

  // Re-fetch data when form submission is successful to show updated values
  // This depends on how `upsertSubscriptionPlanAction` signals success and revalidates.
  // If revalidatePath works correctly, this might not be strictly needed,
  // but direct refetch ensures consistency after the form state updates.
  // We can trigger this by watching a success flag in the form state if needed,
  // or rely on Next.js cache revalidation triggered by `revalidatePath`.
  // For simplicity now, we rely on `revalidatePath`.

  if (loading || isAdmin === null) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>Access Denied.</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <SettingsHeading>Subscription Plan Limits</SettingsHeading>
      <p>
        Manage the local name and usage limits associated with each active
        Stripe Price ID. These limits are used internally by the application.
      </p>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
              >
                Stripe Product (Price Nickname)
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Stripe Price ID
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Local Plan Settings (Name / Limit)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={3} // Adjusted colspan
                  className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center"
                >
                  No active Stripe prices found or failed to load plans.
                </td>
              </tr>
            )}
            {data.map((item) => (
              <tr key={item.stripePriceId}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                  {item.stripeProductName}
                  {item.stripePriceNickname && ` (${item.stripePriceNickname})`}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300 font-mono">
                  {item.stripePriceId}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {/* Render the edit form here */}
                  <PlanEditForm plan={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
