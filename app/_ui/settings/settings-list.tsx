import { SettingsListSettings, SettingListProps } from "@/app/_lib/model";
import { DeleteButtonFactory, EditButtonFactory } from "./buttons";

export default async function SettingsList({
  settings,
}: {
  settings: SettingListProps;
}) {
  return (
    <div className="flex-none lg:flex lg:flex-wrap">
      {settings.settings.map((setting: SettingsListSettings) => {
        //console.log(`Persona: ${persona.ownerId}`);
        return (
          <div className="basis-1/2" key={setting.id}>
            {/* Dark mode: Adjust card background, border, hover border */}
            <div className="m-4 p-4 rounded-lg border-slate-100 dark:border-slate-700 border-2 hover:border-slate-200 dark:hover:border-slate-600 relative group bg-white dark:bg-slate-800">
              <div className="flex flex-row">
                <div className="basis-4/5">
                  {/* Dark mode: Adjust title text color */}
                  <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
                    {setting.title}
                  </h2>
                </div>
                <div className="absolute top-2 right-2 hidden group-hover:block">
                  <div className="inline-block">
                    <DeleteButtonFactory
                      id={`${setting.id}`}
                      resourceType={settings.resourceType}
                    />
                  </div>
                  {!settings.hideEdit && (
                    <div className="inline-block">
                      <EditButtonFactory
                        id={`${setting.id}`}
                        resourceType={settings.resourceType}
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Dark mode: Adjust detail text color */}
              <p className="text-xs ml-6 text-slate-600 dark:text-slate-400 line-clamp-2">
                {setting.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
