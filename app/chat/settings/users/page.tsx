import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/app/_lib/auth";
import UserList from "@/app/_ui/settings/users/user-list";

export default async function UsersPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/chat/settings/profile");
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <UserList />
      </div>
    </div>
  );
}
