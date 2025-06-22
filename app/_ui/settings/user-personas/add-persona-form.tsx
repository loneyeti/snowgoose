import { createUserPersona } from "@/app/_lib/server_actions/persona.actions";
import { Button } from "@/app/_ui/button";
import { useRef } from "react";
import { usePathname } from "next/navigation"; // Import usePathname
import { Logger } from "next-axiom";

interface AddPersonaFormProps {
  onSuccess?: () => void; // Optional callback for successful submission
}

export default function AddPersonaForm({ onSuccess }: AddPersonaFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname(); // Get current path

  // Update formAction to accept originPath
  const formAction = async (formData: FormData, originPath: string) => {
    const log = new Logger({ source: "AddPersonaForm" });
    try {
      // Pass originPath to the server action
      await createUserPersona(formData, originPath);
      // If the action succeeds without throwing, call onSuccess
      if (onSuccess) {
        onSuccess(); // Call the success callback
      }
      // Revalidation should ideally be handled within the server action itself
      // using revalidatePath or revalidateTag from 'next/cache'
    } catch (error) {
      // Handle error display if needed (e.g., using state and showing a message)
      log.error(`Failed to create persona: ${error}`);
      // Optionally, provide user feedback about the error here
    }
  };

  return (
    // Remove onSubmit, add ref. Submission handled by button onClick.
    <form ref={formRef}>
      <div className="flex flex-col space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            htmlFor="name"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            htmlFor="prompt"
          >
            Prompt
          </label>
          <textarea
            name="prompt"
            id="prompt"
            required
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md shadow-sm sm:text-sm"
          ></textarea>
        </div>
        <div className="flex justify-end pt-2">
          {/* Change type to "button" and add onClick handler */}
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              if (formRef.current) {
                const formData = new FormData(formRef.current);
                // Pass the current pathname to formAction
                formAction(formData, pathname);
              }
            }}
          >
            Add Persona
          </Button>
        </div>
      </div>
    </form>
  );
}
