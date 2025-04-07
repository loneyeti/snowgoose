import { isCurrentUserAdmin } from "@/app/_lib/auth";
import { getGlobalPersonas } from "@/app/_lib/server_actions/persona.actions";
import EditPersonaForm from "@/app/_ui/settings/global-personas/edit-persona-form";
import { notFound } from "next/navigation";

export default async function EditPersona({
  params,
}: {
  params: { id: string };
}) {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return <div>Not Allowed</div>;
  }
  const personas = await getGlobalPersonas();
  const persona = personas?.find((p) => p.id === Number(params.id));

  if (!persona) {
    return notFound();
  }
  return <EditPersonaForm persona={persona} />;
}
