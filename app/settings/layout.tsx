import SettingsNav from "../_ui/settings/settings-nav";
import Detail from "../_ui/detail";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SettingsNav />
      <Detail>{children}</Detail>
    </div>
  );
}
