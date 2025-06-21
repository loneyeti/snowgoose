import { SettingsHeading } from "@/app/_ui/typography";
import { createGlobalPersona } from "@/app/_lib/server_actions/persona.actions";
import { isCurrentUserAdmin } from "@/app/_lib/auth";
import { Button } from "@/app/_ui/button";

export default async function NewPersona() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return <div>Not Allowed</div>;
  }

  return (
    <main>
      <SettingsHeading>New Global Persona</SettingsHeading>
      <form action={createGlobalPersona}>
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
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></textarea>
          </div>
          {isAdmin && (
            <div className="py-2">
              <label
                className="text-gray-700 dark:text-gray-300 text-xs"
                htmlFor="personaType"
              >
                Persona Type
              </label>
              <select
                name="personaType"
                className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
              >
                <option value="global">Global</option>
                <option value="user">User</option>
              </select>
            </div>
          )}
          <div className="py-2">
            <Button variant="secondary" type="submit">
              Add Persona
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
