import { User } from "@prisma/client";
import { updateUser } from "@/app/_lib/server_actions/user.actions";
import { MaterialSymbol } from "react-material-symbols";

interface EditUserFormProps {
  user: User;
}

export default function EditUserForm({ user }: EditUserFormProps) {
  return (
    <form action={updateUser} className="space-y-6">
      <input type="hidden" name="id" value={user.id} />

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          defaultValue={user.username}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          defaultValue={user.email || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isAdmin"
          id="isAdmin"
          defaultChecked={user.isAdmin || false}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label
          htmlFor="isAdmin"
          className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Admin Access
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <MaterialSymbol icon="save" size={20} className="mr-2" />
          Save Changes
        </button>
      </div>
    </form>
  );
}
