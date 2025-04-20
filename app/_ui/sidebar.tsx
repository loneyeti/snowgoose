import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex-none md:fixed md:top-0 md:left-0 md:w-80 p-6 md:h-screen w-screen bg-white dark:bg-slate-950"
      data-testid="onboarding-sidebar"
    >
      {" "}
      {/* Added for onboarding tour */}
      <Link href="/chat">
        {/* Light mode logo */}
        <Image
          src="/snowgoose-logo-spring-2025-black-transparent.png"
          alt="Snowgoose logo"
          width={80}
          height={80}
          className="dark:hidden" // Hide in dark mode
        />
        {/* Dark mode logo */}
        <Image
          src="/snowgoose-logo-spring-2025-white-transparent.png" // Use white logo for dark mode
          alt="Snowgoose logo"
          width={80}
          height={80}
          className="hidden dark:block" // Hide in light mode, show in dark
        />
      </Link>
      <span className="dark:text-slate-100 text-slate-900 font-bold text-sm">
        Snowgoose
      </span>
      {children}
    </div>
  );
}
