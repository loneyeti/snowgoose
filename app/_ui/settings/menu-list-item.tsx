import { ReactNode } from "react";
import Link from "next/link";

export default function MenuListItem({
  children,
  url,
}: {
  children: ReactNode;
  url: string;
}) {
  return (
    <li className="cursor-pointer border-l-2 border-transparent px-2 py-2 transition text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-l-slate-700 dark:hover:border-l-slate-300 hover:text-slate-700 dark:hover:text-slate-200">
      <Link href={url}>{children}</Link>
    </li>
  );
}
