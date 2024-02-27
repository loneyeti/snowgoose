import { SettingsHeading } from "@/app/_ui/typography";
import PersonaSkeleton from "@/app/_ui/settings/list-skeleton";
import PersonaList from "@/app/_ui/settings/persona-list";
import { Suspense } from "react";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import OutputFormatList from "@/app/_ui/settings/output-format-list";
import Link from "next/link";

export default async function OutputFormats() {
  return (
    <main>
      <SettingsHeading>Output Formats</SettingsHeading>
      <div className="flex flex-col justify-center mt-6">
        <Suspense
          fallback={
            <>
              <PersonaSkeleton />
              <PersonaSkeleton />
              <PersonaSkeleton />
            </>
          }
        >
          <OutputFormatList />
        </Suspense>
        <Link href="/settings/output-formats/new">
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
      </div>
    </main>
  );
}
