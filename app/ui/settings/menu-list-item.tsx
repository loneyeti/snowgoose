import { ReactNode } from "react";

export default function MenuListItem({children}:{children: ReactNode}) {
    return (
        <li className="cursor-pointer border-l-2 border-transparent px-2 py-2 transition hover:bg-slate-100 hover:border-l-slate-700 hover:text-slate-700">
            {children}
        </li>
    )
}