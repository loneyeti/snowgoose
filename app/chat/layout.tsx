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

export const metadata: Metadata = {
  title: "Snowgoose",
  description: "A Unified AI Chat Engine",
};

// Make the layout component async to fetch data
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user settings server-side
  // Note: Error handling might be needed here
  const user = await getCurrentAPIUser(); // Get user object
  // Fetch settings using the correct action and user ID if user exists
  const settings = user ? await getUserSettingsByUserId(user.id) : null;
  const isDarkMode = settings?.appearanceMode === "dark";

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""}>
      {" "}
      {/* Apply dark class */}
      <AxiomWebVitals />
      <body className={`${montserrat.className} bg-slate-50 dark:bg-slate-900`}>
        {" "}
        {/* Add default dark bg */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
