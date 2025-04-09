import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
