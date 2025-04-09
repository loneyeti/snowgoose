import { getUserPersonas } from "@/app/_lib/server_actions/persona.actions";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import { SettingsHeadingWithButton } from "@/app/_ui/typography";
import { notFound } from "next/navigation";
import { SettingListProps, SettingsListSettings } from "@/app/_lib/model";
import SettingsList from "@/app/_ui/settings/settings-list";
import { Suspense } from "react";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";

export default async function UserPersonasPage() {
  const user = await getCurrentAPIUser();
  if (!user) return notFound();
  const personas = await getUserPersonas(user);
  const settingsListSettings: SettingsListSettings[] = personas.map(
    (persona) => ({
      id: persona.id,
      title: persona.name,
      detail: persona.prompt,
    })
  );

  const settingsListProps: SettingListProps = {
    settings: settingsListSettings,
    resourceType: "personas",
    hideEdit: false,
  };

  return (
    <main>
      <SettingsHeadingWithButton
        href="/chat/settings/user-personas/new"
        buttonTitle="Add User Persona"
      >
        User Personas
      </SettingsHeadingWithButton>
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
    </main>
  );
}
