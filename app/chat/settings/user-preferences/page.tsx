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
    <div>
      <SettingsHeading>User Settings</SettingsHeading>
      <Suspense
        fallback={
          <>
            <ListSkeleton />
            <ListSkeleton />
            <ListSkeleton />
          </>
        }
      >
        <UserSettingsForm />
      </Suspense>
    </div>
  );
}
