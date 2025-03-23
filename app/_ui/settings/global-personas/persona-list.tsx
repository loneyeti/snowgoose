import { getGlobalPersonas } from "@/app/_lib/server_actions/persona.actions";
import PersonaList from "@/app/_ui/settings/persona-list";
import { Persona } from "@prisma/client";
import { DeletePersonaButton, EditPersonaButton } from "../buttons";

export default async function GlobalPersonaList() {
  const globalPersonas = await getGlobalPersonas();

  return <PersonaList personas={globalPersonas} />;
}
