import { User } from "@prisma/client";
import { MaterialSymbol } from "react-material-symbols";
import { getUsers } from "@/app/_lib/server_actions/user.actions";
import Link from "next/link";

export default async function UserList() {
  const users = await getUsers();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user: User) => (
            <li
              key={user.id}
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MaterialSymbol
                    icon={user.isAdmin ? "admin_panel_settings" : "person"}
                    size={24}
                    className="mr-3 text-gray-500 dark:text-gray-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-4">
                      <span>
                        Renewal:{" "}
                        {user.renewalDate
                          ? new Date(user.renewalDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <span>
                        Period Usage: ${(user.periodUsage ?? 0.0).toFixed(2)}
                      </span>
                      <span>
                        Total Usage: ${(user.totalUsage ?? 0.0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded self-start ${
                      user.isAdmin
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                  <Link
                    href={`/settings/users/${user.id}/edit`}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <MaterialSymbol icon="edit" size={20} />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
