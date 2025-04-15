import Link from "next/link";

export function SettingsHeading({ children }: { children: React.ReactNode }) {
  // Dark mode: Adjust border and text color
  return (
    <h1 className="border-b border-slate-200 dark:border-slate-700 py-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">
      {children}
    </h1>
  );
}

export function SettingsHeadingWithButton({
  children,
  href,
  buttonTitle = "Back",
}: {
  children: React.ReactNode;
  href: string;
  buttonTitle?: string;
}) {
  return (
    // Dark mode: Adjust border color
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-6">
      {/* Dark mode: Adjust text color */}
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {children}
      </h1>
      <Link href={href}>
        {/* Dark mode: Adjust button styles */}
        <button className="text-sm rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors px-4 py-2 mr-4">
          {buttonTitle}
        </button>
      </Link>
    </div>
  );
}
