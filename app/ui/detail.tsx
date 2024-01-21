import { ReactNode } from "react";

export default function Detail({children}:{children: ReactNode}) {
    return (
        <div className="p-6 md:ml-80 md:overscroll-contain">
            {children}
        </div>
    )
}