import { getCurrentAPIUser } from "@/app/lib/auth";
import { SettingsHeading } from "@/app/ui/typography";
import { History } from "@/app/lib/model";
import { fetchHistory } from "@/app/lib/api";

export default async function Profile() {
  const apiUser = await getCurrentAPIUser();
  const history = await fetchHistory();
  console.log(history);

  if (!apiUser) return <div>Not logged in</div>;

  return (
    <main>
      <SettingsHeading>Profile</SettingsHeading>
      <div>
        <p>Username: {apiUser.username}</p>
        <p>Email: {apiUser.email}</p>
        <p>ID: {apiUser.id}</p>
        <p>Is Admin?: {apiUser.isAdmin}</p>
      </div>
      <div className="bg-slate-100 min-h-10">
        {history.map((h: History) => {
          <div key={h.id}>
            <p>{h.title}</p>;
          </div>;
        })}
      </div>
    </main>
  );
}
