import { getUserPersonas } from "@/app/_lib/server_actions/persona.actions";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import { notFound } from "next/navigation";
import { SettingListProps, SettingsListSettings } from "@/app/_lib/model";
import UserPersonasClientPage from "./user-personas-client-page"; // Import the new client component

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
    resourceType: "personas", // Keep resourceType for potential use in SettingsList actions (edit/delete)
    hideEdit: false,
  };

  // Render the client component, passing the fetched and formatted data
  return <UserPersonasClientPage settingsListProps={settingsListProps} />;
}
