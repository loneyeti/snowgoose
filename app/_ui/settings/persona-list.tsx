import { Persona } from "@prisma/client";
import { DeletePersonaButton, EditPersonaButton } from "./buttons";

export default async function PersonaList({
  personas,
}: {
  personas: Persona[];
}) {
  return (
    <>
      {personas.map((persona: Persona) => {
        //console.log(`Persona: ${persona.ownerId}`);
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
