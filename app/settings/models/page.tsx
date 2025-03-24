import {
  SettingsHeadingWithButton,
  SettingsHeading,
} from "@/app/_ui/typography";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";
import ModelList from "@/app/_ui/settings/models/model-list";
import { Suspense } from "react";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/server";
import { isCurrentUserAdmin } from "@/app/_lib/auth";
import { getModels } from "@/app/_lib/server_actions/model.actions";
import { SettingListProps, SettingsListSettings } from "@/app/_lib/model";
import { title } from "process";
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
          <p className="text-center">
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
    resourceType: "personas",
    hideEdit: false,
  };

  return (
    <main>
      <SettingsHeadingWithButton
        href="/settings/models/new"
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
