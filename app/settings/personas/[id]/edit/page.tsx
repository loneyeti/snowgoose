import { getPersona } from "@/app/_lib/server_actions/persona.actions";
import EditPersonaForm from "@/app/_ui/settings/personas/edit-persona-form";
import { notFound } from "next/navigation";

export default async function EditPersona({
  params,
}: {
  params: { id: string };
}) {
  const persona = await getPersona(Number(params.id));
  if (!persona) {
    return notFound();
  }
  return <EditPersonaForm persona={persona} />;
}
