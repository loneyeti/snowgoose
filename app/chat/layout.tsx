import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { AxiomWebVitals } from "next-axiom";
import { getUserSettingsByUserId } from "../_lib/server_actions/user-settings.actions"; // Correct action
import { getCurrentAPIUser } from "../_lib/auth"; // To get user object

const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin"],
});

import type { Viewport } from "next"; // Import Viewport type

export const metadata: Metadata = {
  title: "Snowgoose",
  description: "A Unified AI Chat Engine",
  // colorScheme removed from here
};

// Add generateViewport function for colorScheme
export const viewport: Viewport = {
  colorScheme: "light dark",
};

// Helper component to inject the theme script safely
function ThemeScript({
  appearanceMode,
}: {
  appearanceMode: string | undefined | null;
}) {
  const mode = appearanceMode || "light"; // Default to light if null/undefined
  // Revised script for more robust theme application
  const scriptContent = `
(function() {
  try {
    const mode = '${mode}'; // Passed from server ('light', 'dark', or 'system')
    const root = document.documentElement;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark) => {
      root.classList.toggle('dark', isDark);
    };

    if (mode === 'system') {
      applyTheme(systemPreference.matches);
      // Optional: Listen for changes while page is open
      // systemPreference.addEventListener('change', (e) => applyTheme(e.matches));
    } else if (mode === 'dark') {
      applyTheme(true); // Explicitly set dark
    } else {
      applyTheme(false); // Explicitly set light (remove dark class)
    }
  } catch (e) {
    // Avoid breaking rendering if script fails
    console.error("Error applying theme:", e);
  }
})();
  `;
  // Use dangerouslySetInnerHTML for immediate execution in <head>
  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}

// Make the layout component async to fetch data
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user settings server-side
  const user = await getCurrentAPIUser(); // Get user object
  const settings = user ? await getUserSettingsByUserId(user.id) : null;

  // Determine initial class based ONLY on explicit 'dark' setting for SSR
  const initialThemeClass = settings?.appearanceMode === "dark" ? "dark" : "";
  const appearanceModeSetting = settings?.appearanceMode; // Pass the actual setting to the script

  return (
    // Add suppressHydrationWarning because the inline script might change className before hydration
    <html lang="en" className={initialThemeClass} suppressHydrationWarning>
      <head>
        {/* Inject script to handle 'system' mode client-side before paint */}
        <ThemeScript appearanceMode={appearanceModeSetting} />
      </head>
      <AxiomWebVitals />
      <body className={`${montserrat.className} bg-slate-50 dark:bg-slate-900`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
