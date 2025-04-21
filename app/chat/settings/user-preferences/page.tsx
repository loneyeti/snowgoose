import UserSettingsForm from "@/app/_ui/settings/user-preferences/user-preferences-form";
import { SettingsHeading } from "@/app/_ui/typography";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/server";

export default async function UserSettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <main>
      {" "}
      {/* Changed div to main for semantic consistency */}
      <SettingsHeading>User Settings</SettingsHeading>
      {/* Added consistent container for spacing and max-width */}
      <div className="mt-6 space-y-6 max-w-4xl">
        <Suspense
          fallback={
            <>
              <ListSkeleton />
              <ListSkeleton />
              <ListSkeleton />
            </>
          }
        >
          {/* The form itself might need internal styling adjustments */}
          <UserSettingsForm />
        </Suspense>
      </div>
    </main>
  );
}
