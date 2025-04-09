import { SettingsHeading } from "@/app/_ui/typography";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import PasswordResetForm from "@/app/_ui/settings/profile/password-reset-form";
import ManageSubscriptionButton from "@/app/_ui/settings/profile/ManageSubscriptionButton";
import { createCustomerPortalSessionAction } from "@/app/_lib/server_actions/stripe.actions";

export default async function Profile() {
  const apiUser = await getCurrentAPIUser();

  if (!apiUser) return <div>Not logged in</div>;

  return (
    <main>
      <SettingsHeading>Profile Settings</SettingsHeading>
      <div className="w-2/3 flex justify-center flex-col">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="py-2">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-700 text-xs">Email:</span>
              <span className="font-medium">{apiUser.email}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-xl font-semibold mb-4">Password Settings</h2>
          <PasswordResetForm />
        </div>

        {/* Conditionally render Subscription Settings */}
        {apiUser.stripeCustomerId && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4">
              Subscription Settings
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Manage your billing information and subscription plan.
            </p>
            <ManageSubscriptionButton
              createPortalSessionAction={createCustomerPortalSessionAction}
            />
          </div>
        )}

        {/* Sign Out Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-xl font-semibold mb-4">Sign Out</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to sign out of your account.
          </p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
