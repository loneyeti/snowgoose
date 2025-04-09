import {
  getUserPersonas,
  getPersona,
} from "@/app/_lib/server_actions/persona.actions";
import EditPersonaForm from "@/app/_ui/settings/user-personas/edit-persona-form";
import { notFound } from "next/navigation";
import { getCurrentAPIUser } from "@/app/_lib/auth";

export default async function EditPersona({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentAPIUser();
  if (!user) {
    return notFound();
  }

  const persona = await getPersona(Number(params.id));
  //const persona = personas?.find((p) => p.id === Number(params.id));

  if (!persona) {
    return notFound();
  }
  return <EditPersonaForm persona={persona} />;
}
