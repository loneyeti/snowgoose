import HistoryList from "@/app/_ui/history-list";
import { SettingsHeading } from "@/app/_ui/typography";
import PersonaSkeleton from "@/app/_ui/settings/persona-skeleton";
import { Suspense } from "react";

export default function HistoryPage() {
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
