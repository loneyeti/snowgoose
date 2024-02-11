import { ReactNode } from "react";

export default function Detail({ children }: { children: ReactNode }) {
  return (
    <div className="p-6 h-screen md:ml-80 md:overscroll-contain">
      {children}
    </div>
  );
}
