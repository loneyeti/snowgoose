import SettingsNav from "@/app/_ui/settings/settings-nav";
import Detail from "@/app/_ui/detail";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Use flexbox for layout: column on mobile, row on desktop
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar takes fixed width on desktop, full width on mobile (handled in Sidebar component) */}
      <SettingsNav />
      {/* Detail takes remaining space on desktop */}
      <Detail>{children}</Detail>
    </div>
  );
}
