import PersonaList from "@/app/_ui/settings/persona-list";
import { getUserPersonas } from "@/app/_lib/server_actions/persona.actions";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import { SettingsHeading } from "@/app/_ui/typography";
import { MaterialSymbol } from "react-material-symbols";
import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function UserPersonasPage() {
  const user = await getCurrentAPIUser();
  if (!user) return notFound();
  const personas = await getUserPersonas(user);
  console.log(`User Personas: ${personas}`);
  return (
    <main>
      <SettingsHeading>User Personas</SettingsHeading>
      <PersonaList personas={personas} />
      <Link href="/settings/user-personas/new">
        <div className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-200 hover:bg-slate-300">
          <div>
            <p className="text-lg font-semibold">
              <MaterialSymbol
                icon="add_circle"
                size={24}
                className="mr-2 align-middle"
              ></MaterialSymbol>
              Add new
            </p>
          </div>
        </div>
      </Link>
    </main>
  );
}
