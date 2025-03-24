import Link from "next/link";

export function SettingsHeading({ children }: { children: React.ReactNode }) {
  return <h1 className="border-b py-6 text-2xl font-semibold">{children}</h1>;
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
    <div className="flex items-center justify-between border-b py-6">
      <h1 className="text-2xl font-semibold">{children}</h1>
      <Link href={href}>
        <button className="text-sm rounded-full bg-slate-200 hover:bg-slate-300 transition-colors px-4 py-2 mr-4">
          {buttonTitle}
        </button>
      </Link>
    </div>
  );
}
