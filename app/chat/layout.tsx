import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { AxiomWebVitals } from "next-axiom";
import { getUserSettingsByUserId } from "../_lib/server_actions/user-settings.actions";
import { getCurrentAPIUser } from "../_lib/auth";
import ProductTour from "../_ui/onboarding/ProductTour";
import { ThemeProvider } from "../_ui/theme-provider";
import { ThemeEffect } from "../_ui/theme-effect";

const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snowgoose",
  description: "A Unified AI Chat Engine",
};

// Make the layout component async to fetch data
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user settings and the full user object server-side
  const user = await getCurrentAPIUser();
  const settings = user ? await getUserSettingsByUserId(user.id) : null;

  // Determine initial theme based on user settings
  const userTheme = settings?.appearanceMode || "system";

  return (
    <div className={montserrat.className}>
      <AxiomWebVitals />
      <ThemeProvider defaultTheme={userTheme}>
        <ThemeEffect initialTheme={userTheme} />
        <div className="bg-white dark:bg-slate-950">
          {children}
          {/* Conditionally render the Product Tour */}
          {user && (
            <ProductTour userId={user.id} runTour={!user.onboardingCompleted} />
          )}
          <Toaster />
        </div>
      </ThemeProvider>
    </div>
  );
}
