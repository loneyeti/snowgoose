import SettingsNav from "@/app/_ui/settings/settings-nav";
import Detail from "@/app/_ui/detail";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SettingsNav />
      <Detail>{children}</Detail>
    </div>
  );
}
