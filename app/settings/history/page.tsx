import HistoryList from "@/app/_ui/history-list";
import { SettingsHeading } from "@/app/_ui/typography";
import PersonaSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <div>
      <SettingsHeading>History</SettingsHeading>
      <Suspense
        fallback={
          <>
            <PersonaSkeleton />
            <PersonaSkeleton />
            <PersonaSkeleton />
          </>
        }
      >
        <HistoryList />
      </Suspense>
    </div>
  );
}
