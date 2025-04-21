import { ReactNode } from "react";

export default function Detail({ children }: { children: ReactNode }) {
  return (
    // Adjusted for flex layout: grows to fill space, scrolls independently.
    // Added background colors for visual separation. Removed fixed height and desktop margin.
    <div className="flex-grow p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {children}
    </div>
  );
}
