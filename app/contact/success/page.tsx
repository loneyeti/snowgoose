import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";

export default function ContactSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="flex justify-center mb-6">
        <MaterialSymbol
          icon="check_circle"
          size={64}
          className="text-green-500"
        />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Message Sent!
      </h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400">
        Thank you for contacting us. We&apos;ll review your message and get back
        to {/* Fixed apostrophe */}
        you as soon as possible.
      </p>
      <Link
        href="/chat"
        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
      >
        Return to Chat
      </Link>
    </div>
  );
}
