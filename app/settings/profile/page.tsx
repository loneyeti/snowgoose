import { getCurrentAPIUser } from "@/app/_lib/auth";
import { UserProfile } from "@clerk/nextjs";

export default async function Profile() {
  const apiUser = await getCurrentAPIUser();

  if (!apiUser) return <div>Not logged in</div>;

  return (
    <main>
      <div className="pb-8">
        <UserProfile />
      </div>
    </main>
  );
}
