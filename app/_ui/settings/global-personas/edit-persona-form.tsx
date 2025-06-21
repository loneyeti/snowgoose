import { SettingsHeading } from "@/app/_ui/typography";
import { updatePersona } from "@/app/_lib/server_actions/persona.actions";
import { Persona } from "@prisma/client";
import { Button } from "@/app/_ui/button";

export default async function EditGlobalPersonaForm({
  persona,
}: {
  persona: Persona;
}) {
  return (
    <main>
      <SettingsHeading>Edit Persona</SettingsHeading>
      <form action={updatePersona}>
        <input type="hidden" name="id" value={persona.id} />
        <input type="hidden" name="ownerId" value={Number(persona.ownerId)} />
        <div className="w-2/3 flex justify-center flex-col">
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={persona.name}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            />
          </div>
          <div className="py-2">
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="prompt"
            >
              Prompt
            </label>
            <textarea
              name="prompt"
              defaultValue={persona.prompt}
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            />
          </div>
          <div className="py-2">
            <Button variant="secondary" type="submit">
              Update Persona
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
