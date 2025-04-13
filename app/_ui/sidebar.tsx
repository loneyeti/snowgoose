import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <div className="flex-none md:fixed md:top-0 md:left-0 md:w-80 p-6 md:h-screen w-screen bg-slate-50">
      <Link href="/chat">
        <Image
          src="/snowgoose-logo-2025-black.png"
          alt="Snowgoose logo"
          width={140}
          height={80}
        />
      </Link>
      {children}
    </div>
  );
}
