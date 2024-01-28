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
    <li className="cursor-pointer border-l-2 border-transparent px-2 py-2 transition hover:bg-slate-100 hover:border-l-slate-700 hover:text-slate-700">
      <Link href={url}>{children}</Link>
    </li>
  );
}
