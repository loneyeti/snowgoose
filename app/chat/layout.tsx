import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { AxiomWebVitals } from "next-axiom";

const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snowgoose",
  description: "A Unified AI Chat Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AxiomWebVitals />
      <body className={montserrat.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
