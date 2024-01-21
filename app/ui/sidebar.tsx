import { ReactNode } from "react";
import Image from "next/image";

export default function Sidebar({children}:{children: ReactNode}) {
    return (
        <div className="flex-none md:fixed md:top-0 md:left-0 md:w-80 p-6 md:h-screen w-screen bg-slate-50">
            <Image src='/snowgoose-logo.png' alt="Snowgoose logo" width={140} height={80} />
            {children}
        </div>
    )

}