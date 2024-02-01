import { getCurrentAPIUser } from "@/app/lib/auth";
import { fetchHistory } from "@/app/lib/api";
import { UserProfile } from "@clerk/nextjs";

export default async function Profile() {
  const apiUser = await getCurrentAPIUser();
  const history = await fetchHistory();
  console.log(history);

  if (!apiUser) return <div>Not logged in</div>;

  return (
    <main>
      <div className="pb-8">
        <UserProfile />
      </div>
    </main>
  );
}
