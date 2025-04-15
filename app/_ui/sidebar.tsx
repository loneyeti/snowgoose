import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <div className="flex-none md:fixed md:top-0 md:left-0 md:w-80 p-6 md:h-screen w-screen bg-slate-50 dark:bg-slate-900">
      <Link href="/chat">
        {/* Light mode logo */}
        <Image
          src="/snowgoose-logo-2025-black.png"
          alt="Snowgoose logo"
          width={80}
          height={80}
          className="dark:hidden" // Hide in dark mode
        />
        {/* Dark mode logo */}
        <Image
          src="/snowgoose-logo-2025-white.png" // Use white logo for dark mode
          alt="Snowgoose logo"
          width={80}
          height={80}
          className="hidden dark:block" // Hide in light mode, show in dark
        />
      </Link>
      <span className="dark:text-slate-100 font-bold text-sm">Snowgoose</span>
      {children}
    </div>
  );
}
