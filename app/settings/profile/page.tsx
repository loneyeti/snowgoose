import { getCurrentAPIUser } from "@/app/_lib/auth";

export default async function Profile() {
  const apiUser = await getCurrentAPIUser();

  if (!apiUser) return <div>Not logged in</div>;

  return (
    <main>
      <div className="pb-8">User profile here</div>
    </main>
  );
}
