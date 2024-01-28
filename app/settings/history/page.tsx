import HistoryList from "@/app/ui/history-list";
import { SettingsHeading } from "@/app/ui/typography";
import PersonaSkeleton from "@/app/ui/settings/persona-skeleton";
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
