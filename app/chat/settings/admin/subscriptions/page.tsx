"use client";

import { useEffect, useState } from "react";
// Removed form state hooks
import { useRouter } from "next/navigation"; // Use for redirecting non-admins
import { isCurrentUserAdmin } from "@/app/_lib/auth"; // Client-side check possible? Re-evaluate if needed server-side
import {
  getAdminSubscriptionData,
  // Removed unused action and state type
  AdminSubscriptionViewData,
} from "@/app/_lib/server_actions/subscription-plan.actions";
import { SettingsHeading } from "@/app/_ui/typography"; // Import the correct component
// Removed Button import

// Removed SubmitButton component
// Removed PlanEditForm component

export default function AdminSubscriptionsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [data, setData] = useState<AdminSubscriptionViewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check admin status and fetch data on component mount
    const checkAdminAndFetch = async () => {
      try {
        // Note: isCurrentUserAdmin might need adjustment if it relies on server context
        // For robust protection, the server action *must* re-verify admin status.
        const adminStatus = await isCurrentUserAdmin(); // Assuming this works client-side or fetches status
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          router.push("/chat/settings"); // Redirect non-admins
          return;
        }

        const fetchedData = await getAdminSubscriptionData();
        setData(fetchedData);
      } catch (err: any) {
        console.error("Error loading admin subscription page:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [router]); // Add router to dependency array

  if (loading || isAdmin === null) {
    return <p>Loading...</p>; // Use standard <p> tag
  }

  if (!isAdmin) {
    // This might be brief due to redirect, but good practice
    return <p>Access Denied.</p>; // Use standard <p> tag
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>; // Use standard <p> tag
  }

  return (
    <div className="space-y-6">
      {/* Use SettingsHeading for the main title */}
      <SettingsHeading>Active Customer Subscriptions</SettingsHeading>
      {/* Use standard <p> tag for paragraph */}
      <p>
        This page lists all currently active subscriptions from Stripe, along
        with any associated local plan settings found in the database.
      </p>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Stripe Plan (Price ID)
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Period End
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Local Plan (Name / Limit)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center"
                >
                  No active Stripe subscriptions found.
                </td>
              </tr>
            )}
            {data.map((item) => (
              <tr key={item.stripeSubscriptionId}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                  {item.stripeCustomerEmail || item.stripeCustomerId}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {item.stripeProductName} ({item.stripePriceId})
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {item.stripeStatus}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {item.stripeCurrentPeriodEnd.toLocaleDateString()}
                </td>
                {/* Display local plan info read-only */}
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {item.localPlanName
                    ? `${item.localPlanName} / ${item.localUsageLimit}`
                    : "Not Set"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
