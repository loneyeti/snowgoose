import DefaultModelForm from "@/app/_ui/settings/admin/default-model-form";
import { SettingsHeading } from "@/app/_ui/typography";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";
import { Suspense } from "react";
import { isCurrentUserAdmin } from "@/app/_lib/auth";

export default async function DefaultModelPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return <div>Not Allowed</div>;
  }

  return (
    <main>
      <SettingsHeading>Default Model</SettingsHeading>
      <div className="mt-6 space-y-6 max-w-4xl">
        <Suspense fallback={<ListSkeleton />}>
          <DefaultModelForm />
        </Suspense>
      </div>
    </main>
  );
}
