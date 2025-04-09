import { getGlobalPersonas } from "@/app/_lib/server_actions/persona.actions";
import { SettingsHeadingWithButton } from "@/app/_ui/typography";
import SettingsList from "@/app/_ui/settings/settings-list";
import { SettingListProps, SettingsListSettings } from "@/app/_lib/model";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";

export default async function GlobalPersonasPage() {
  const personas = await getGlobalPersonas();

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
        href="/chat/settings/global-personas/new"
        buttonTitle="Add Global Persona"
      >
        Global Personas
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
