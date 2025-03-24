import { Persona } from "@prisma/client";
import { DeletePersonaButton, EditPersonaButton } from "./buttons";

export default async function PersonaList({
  personas,
}: {
  personas: Persona[];
}) {
  return (
    <div className="flex-none lg:flex lg:flex-wrap">
      {personas.map((persona: Persona) => {
        //console.log(`Persona: ${persona.ownerId}`);
        return (
          <div className="basis-1/2" key={persona.id}>
            <div className="m-4 p-4 rounded-lg border-slate-100 border-2 hover:border-slate-200 relative group">
              <div className="flex flex-row">
                <div className="basis-4/5">
                  <h2 className="text-lg font-semibold mb-3">{persona.name}</h2>
                </div>
                <div className="absolute top-2 right-2 hidden group-hover:block">
                  <div className="inline-block">
                    <DeletePersonaButton id={`${persona.id}`} />
                  </div>
                  <div className="inline-block">
                    <EditPersonaButton id={`${persona.id}`} />
                  </div>
                </div>
              </div>
              <p className="text-xs ml-6 text-slate-600 line-clamp-2">
                {persona.prompt}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
