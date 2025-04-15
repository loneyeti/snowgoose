import {
  SettingsHeadingWithButton,
  SettingsHeading,
} from "@/app/_ui/typography";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";
import "react-material-symbols/outlined";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/server";
import { isCurrentUserAdmin } from "@/app/_lib/auth";
import { getModels } from "@/app/_lib/server_actions/model.actions";
import { SettingListProps, SettingsListSettings } from "@/app/_lib/model";
import SettingsList from "@/app/_ui/settings/settings-list";

export default async function Models() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const isUserAdmin = await isCurrentUserAdmin();

  if (!isUserAdmin) {
    return (
      <main>
        <SettingsHeading>Models</SettingsHeading>
        <div className="flex flex-col justify-center mt-6">
          {/* Dark mode: Adjust text color */}
          <p className="text-center text-slate-700 dark:text-slate-300">
            You do not have permission to view this page.
          </p>
        </div>
      </main>
    );
  }

  const models = await getModels();

  const settingsListSettings: SettingsListSettings[] = models.map((model) => ({
    id: model.id,
    title: model.name,
    detail: model.apiName,
  }));

  const settingsListProps: SettingListProps = {
    settings: settingsListSettings,
    resourceType: "models",
    hideEdit: false,
  };

  return (
    <main>
      <SettingsHeadingWithButton
        href="/chat/settings/models/new"
        buttonTitle="Add Model"
      >
        Models
      </SettingsHeadingWithButton>
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
          <SettingsList settings={settingsListProps} />
        </Suspense>
      </div>
    </main>
  );
}
