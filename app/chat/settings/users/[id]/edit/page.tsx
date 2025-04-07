import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/app/_lib/auth";
import { getUser } from "@/app/_lib/server_actions/user.actions";
import EditUserForm from "@/app/_ui/settings/users/edit-user-form";

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/settings/profile");
  }

  const user = await getUser(parseInt(params.id));

  if (!user) {
    redirect("/settings/users");
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit User</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <EditUserForm user={user} />
        </div>
      </div>
    </div>
  );
}
