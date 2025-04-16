import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "./marketing.css";
import { ThemeProvider } from "./_ui/theme-provider";

const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snowgoose",
  description: "GPT Frontend",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <ThemeProvider defaultTheme="system">
          {children}
          {/* Google Analytics Scripts */}
          <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-QYYK6M4TJY"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QYYK6M4TJY');
            `}
          </Script>
        </ThemeProvider>
      </body>
    </html>
  );
}
