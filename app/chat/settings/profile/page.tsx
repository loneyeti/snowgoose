import { SettingsHeading } from "@/app/_ui/typography";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import ManageSubscriptionButton from "@/app/_ui/settings/profile/ManageSubscriptionButton";
import { createCustomerPortalSessionAction } from "@/app/_lib/server_actions/stripe.actions";

export default async function Profile() {
  const apiUser = await getCurrentAPIUser();

  if (!apiUser) return <div>Not logged in</div>;

  return (
    <main>
      <SettingsHeading>Profile Settings</SettingsHeading>
      {/* Dark mode: Adjust container text color if needed, though SettingsHeading handles its own */}
      <div className="w-2/3 flex justify-center flex-col">
        {/* Dark mode: Adjust card background, shadow, text */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Profile Information
          </h2>
          <div className="py-2">
            {/* Dark mode: Adjust border, text colors */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-gray-700 dark:text-gray-300 text-xs">
                Email:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {apiUser.email}
              </span>
            </div>
          </div>
        </div>

        {/* Conditionally render Subscription Settings */}
        {apiUser.stripeCustomerId && (
          // Dark mode: Adjust card background, shadow, text
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Subscription Settings
            </h2>
            {/* Dark mode: Adjust paragraph text color */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage your billing information and subscription plan.
            </p>
            <ManageSubscriptionButton
              createPortalSessionAction={createCustomerPortalSessionAction}
            />
          </div>
        )}

        {/* Sign Out Section */}
        {/* Dark mode: Adjust card background, shadow, text */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 p-6 mt-4">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Sign Out
          </h2>
          {/* Dark mode: Adjust paragraph text color */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Click the button below to sign out of your account.
          </p>
          <form action="/auth/signout" method="post">
            {/* Dark mode: Adjust sign out button styles */}
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:focus-visible:outline-red-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
