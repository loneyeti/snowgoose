import { SettingsHeading } from "@/app/_ui/typography";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/server";
import { getHistory } from "@/app/_lib/server_actions/history.actions";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import { SettingListProps, SettingsListSettings } from "@/app/_lib/model";
import SettingsList from "@/app/_ui/settings/settings-list";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const user = await getCurrentAPIUser();
  if (!user) {
    redirect("/login");
  }

  const histories = await getHistory(user.id);

  const settingsListSettings: SettingsListSettings[] = histories.map(
    (history) => ({
      id: history.id,
      title: history.title ?? "Unknown Conversation",
      detail: history.conversation,
    })
  );

  const settingsListProps: SettingListProps = {
    settings: settingsListSettings,
    resourceType: "history",
    hideEdit: true,
  };

  return (
    <div>
      <SettingsHeading>History</SettingsHeading>
      <Suspense
        fallback={
          <>
            <ListSkeleton />
            <ListSkeleton />
            <ListSkeleton />
          </>
        }
      >
        <SettingsList settings={settingsListProps} />
      </Suspense>
    </div>
  );
}
