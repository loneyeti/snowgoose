import type { Metadata } from "next";
import Script from "next/script"; // Import the Script component
import "./marketing.css"; // Import marketing-specific styles

export const metadata: Metadata = {
  title: "Snowgoose",
  description: "GPT Frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
