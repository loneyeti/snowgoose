import UserSettingsForm from "@/app/_ui/settings/user-preferences/user-preferences-form";
import { SettingsHeading } from "@/app/_ui/typography";
import PersonaSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";

export default function UserSettingsPage() {
  return (
    <div>
      <SettingsHeading>User Settings</SettingsHeading>
      <Suspense
        fallback={
          <>
            <PersonaSkeleton />
            <PersonaSkeleton />
            <PersonaSkeleton />
          </>
        }
      >
        <UserSettingsForm />
      </Suspense>
    </div>
  );
}
