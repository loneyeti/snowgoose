import { SettingsHeading } from "@/app/_ui/typography";
import { createPersona, fetchPersona } from "@/app/_lib/api";
import { Persona } from "@/app/_lib/model";
import EditPersonaForm from "@/app/_ui/settings/personas/edit-persona-form";
import { notFound } from "next/navigation";

export default async function EditPersona({
  params,
}: {
  params: { id: string };
}) {
  const persona = await fetchPersona(params.id);
  if (!persona) {
    return notFound();
  }
  return <EditPersonaForm persona={persona} />;
}
