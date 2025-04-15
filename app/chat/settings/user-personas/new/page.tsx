import { SettingsHeading } from "@/app/_ui/typography";
import { createUserPersona } from "@/app/_lib/server_actions/persona.actions";

export default async function NewPersona() {
  return (
    <main>
      <SettingsHeading>New User Persona</SettingsHeading>
      <form action={createUserPersona}>
        <div className="w-2/3 flex justify-center flex-col">
          <div className="py-2">
            {/* Dark mode: Adjust label color */}
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="name"
            >
              Name
            </label>
            {/* Dark mode: Adjust input styles */}
            <input
              type="text"
              name="name"
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            />
          </div>
          <div className="py-2">
            {/* Dark mode: Adjust label color */}
            <label
              className="text-gray-700 dark:text-gray-300 text-xs"
              htmlFor="prompt"
            >
              Prompt
            </label>
            {/* Dark mode: Adjust textarea styles */}
            <textarea
              name="prompt"
              className="block w-full mt-0 px-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-0 focus:border-black dark:focus:border-blue-500 rounded-md"
            ></textarea>
          </div>
          <div className="py-2">
            {/* Dark mode: Use generic Button component */}
            <Button variant="secondary" type="submit">
              Add Persona
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
// Need to import Button
import { Button } from "@/app/_ui/button";
