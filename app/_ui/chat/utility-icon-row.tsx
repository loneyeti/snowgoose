import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { toast } from "sonner";
import { Chat } from "../../_lib/model";
import { saveChat } from "../../_lib/server_actions/history.actions";
import { User } from "@prisma/client";

export default function UtilityIconRow({
  resetChat,
  toggleHistory,
  user,
  chat,
}: {
  resetChat: () => void;
  toggleHistory: () => void;
  user: User;
  chat: Chat | undefined;
}) {
  async function saveChatAction() {
    try {
      if (chat) {
        const saveMessage = await saveChat(chat);
        toast.success(`Saved conversation: ${saveMessage}`);
      } else {
        console.error("No chat to save");
        toast.error("No conversation to save");
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      toast.error("Failed to save conversation");
    }
  }
  const initial = user.username.charAt(0).toUpperCase() ?? "";
  return (
    // Use flex-wrap, center on mobile, justify-end on larger screens. Add gap.
    <div className="flex flex-row flex-wrap justify-center sm:justify-end items-center gap-2">
      {/* Dark mode: Adjust icon colors and hover states. Removed basis-1/5, adjusted padding/rounding */}
      <Link
        href="/chat"
        onClick={resetChat}
        title="New Chat"
        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-md transition-colors"
      >
        <MaterialSymbol icon="add" size={24} />
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          saveChatAction();
        }}
        title="Save Chat"
        data-testid="onboarding-save"
        className="text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
      >
        <MaterialSymbol icon="save" size={24} />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleHistory();
        }}
        title="Show History"
        data-testid="onboarding-show-history"
        className="text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
      >
        <MaterialSymbol icon="history" size={24} />
      </button>
      {/* Help Icon Link */}
      <Link
        href="https://docs.snowgoose.app"
        target="_blank" // Open in new tab
        rel="noopener noreferrer" // Security best practice for target="_blank"
        title="Help / Documentation"
        className="text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
      >
        <MaterialSymbol icon="help_outline" size={24} />
      </Link>
      <Link
        href="/chat/settings/profile"
        title="Settings"
        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-md transition-colors"
        data-testid="onboarding-show-settings"
      >
        <MaterialSymbol icon="settings" size={24} />
      </Link>
      {/* Profile Icon - Removed basis-1/5 and extra div */}
      {/* Dark mode: Adjust profile icon colors */}
      <Link
        href="/chat/settings/profile"
        title="Profile"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-500 text-white dark:text-slate-100 hover:bg-slate-700 dark:hover:bg-slate-400 transition-colors"
      >
        <span className="text-sm font-medium">{initial}</span>
      </Link>
      {/* Removed extra closing div from previous edit */}
    </div> // Added missing closing div
  );
}
