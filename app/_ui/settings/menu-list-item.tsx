"use client"; // Required for usePathname hook

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx"; // Utility for conditional classes

export default function MenuListItem({
  children,
  url,
  ...rest // Capture any other props like data-testid
}: {
  children: ReactNode;
  url: string;
  [key: string]: any; // Allow additional props
}) {
  const pathname = usePathname();
  const isActive = pathname === url;

  return (
    <li {...rest}>
      {" "}
      {/* Spread additional props here */}
      <Link
        href={url}
        className={clsx(
          "flex items-center rounded-md px-3 py-2 transition duration-150 ease-in-out border-l-4", // Base styles: flex, rounded, padding, transition, left border
          {
            // Active state styles
            "bg-sky-100 dark:bg-sky-900 border-sky-600 dark:border-sky-400 text-sky-700 dark:text-sky-200 font-medium":
              isActive,
            // Inactive state styles
            "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200":
              !isActive,
          }
        )}
      >
        {children}
      </Link>
    </li>
  );
}
