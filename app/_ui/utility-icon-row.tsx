import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { Chat } from "../_lib/model";
import { saveChat } from "../_lib/server_actions/history.actions";
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
        console.log(
          `Saving chat. Model: ${chat.model} Persona: ${chat.personaId}`
        );
        const saveMessage = await saveChat(chat);
        alert(`Saved conversation: ${saveMessage}`);
      } else {
        console.error("No chat to save");
        alert("No conversation to save");
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      alert("Failed to save conversation");
    }
  }
  const initial = user.username.charAt(0).toUpperCase() ?? "";
  return (
    <div className="flex flex-row justify-between align-middle">
      <Link
        href="/"
        onClick={resetChat}
        className="basis-1/5 text-slate-600 text-center p-3 rounded-l-lg self-center place-self-center align-middle"
      >
        <MaterialSymbol className="align-middle" icon="add" size={24} />
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          saveChatAction();
        }}
        className="basis-1/5 text-slate-600 text-center p-3 hover:bg-slate-100 rounded"
      >
        <MaterialSymbol className="align-middle" icon="save" size={24} />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleHistory();
        }}
        className="basis-1/5 text-slate-600 text-center p-3"
      >
        <MaterialSymbol className="align-middle" icon="history" size={24} />
      </button>
      <Link
        href="/settings/profile"
        className="basis-1/5 text-slate-600  text-center p-3 rounded-r-lg"
      >
        <MaterialSymbol className="align-middle" icon="settings" size={24} />
      </Link>
      <div className="basis-1/5 place-self-center">
        <div className="pl-2">
          <Link
            href="/settings/profile"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-medium">{initial}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
