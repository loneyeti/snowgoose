import SettingsNav from "../ui/settings/settings-nav";
import Detail from "../ui/detail";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SettingsNav />
      <Detail>{children}</Detail>
    </div>
  );
}
