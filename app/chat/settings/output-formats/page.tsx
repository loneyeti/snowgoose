import { SettingsHeading } from "@/app/_ui/typography";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import OutputFormatList from "@/app/_ui/settings/output_formats/output-format-list";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/server";

export default async function OutputFormats() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <main>
      <SettingsHeading>Output Formats</SettingsHeading>
      <div className="flex flex-col justify-center mt-6">
        <Suspense
          fallback={
            <>
              <ListSkeleton />
              <ListSkeleton />
              <ListSkeleton />
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
