import { getUserPersonas } from "@/app/_lib/server_actions/persona.actions";
import { Persona } from "@prisma/client";
import { DeletePersonaButton, EditPersonaButton } from "../buttons";
import { getCurrentAPIUser } from "@/app/_lib/auth";

export default async function PersonaList() {
  const user = await getCurrentAPIUser();

  if (!user) return <div>User not found</div>;

  const personas = await getUserPersonas(user);

  return (
    <>
      {personas.map((persona: Persona) => {
        console.log(`Persona: ${persona.ownerId}`);
        return (
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50"
            key={persona.id}
          >
            <h2 className="text-lg font-semibold mb-3">{persona.name}</h2>
            <p className="text-xs ml-6 text-slate-600">{persona.prompt}</p>
            <DeletePersonaButton id={`${persona.id}`} />
            <EditPersonaButton id={`${persona.id}`} />
          </div>
        );
      })}
    </>
  );
}
