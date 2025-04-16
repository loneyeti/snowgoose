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
    <div className="flex flex-row justify-between align-middle">
      {/* Dark mode: Adjust icon colors and hover states */}
      <Link
        href="/chat"
        onClick={resetChat}
        className="basis-1/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-center p-3 rounded-l-lg self-center place-self-center align-middle transition-colors"
      >
        <MaterialSymbol className="align-middle" icon="add" size={24} />
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          saveChatAction();
        }}
        data-testid="onboarding-save"
        className="basis-1/5 text-slate-600 dark:text-slate-400 text-center p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
      >
        <MaterialSymbol className="align-middle" icon="save" size={24} />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleHistory();
        }}
        data-testid="onboarding-show-history"
        className="basis-1/5 text-slate-600 dark:text-slate-400 text-center p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
      >
        <MaterialSymbol className="align-middle" icon="history" size={24} />
      </button>
      <Link
        href="/chat/settings/profile"
        className="basis-1/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-center p-3 rounded-r-lg transition-colors"
        data-testid="onboarding-show-settings"
      >
        <MaterialSymbol className="align-middle" icon="settings" size={24} />
      </Link>
      <div className="basis-1/5 place-self-center">
        <div className="pl-2">
          {/* Dark mode: Adjust profile icon colors */}
          <Link
            href="/chat/settings/profile"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-500 text-white dark:text-slate-100 hover:bg-slate-700 dark:hover:bg-slate-400 transition-colors"
          >
            <span className="text-sm font-medium">{initial}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
