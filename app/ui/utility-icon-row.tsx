import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { Chat } from "../lib/model";
import { saveChat } from "../lib/api";
import { UserButton } from "@clerk/nextjs";

export default function UtilityIconRow({
  resetChat,
  toggleHistory,
  chat,
}: {
  resetChat: () => void;
  toggleHistory: () => void;
  chat: Chat | undefined;
}) {
  async function saveChatAction() {
    if (chat) {
      console.log(
        `Would save this chat. Model: ${chat.model} Persona: ${chat.persona}`
      );
      const saveMessage = await saveChat(chat);
      alert(saveMessage);
    }
  }
  return (
    <div className="flex flex-row mt-8 justify-between mb-10 align-middle">
      <Link
        href="/"
        onClick={resetChat}
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3 rounded-l-lg self-center place-self-center align-middle"
      >
        <MaterialSymbol className="align-middle" icon="add" size={18} />
      </Link>
      <button
        onClick={saveChatAction}
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3"
      >
        <MaterialSymbol className="align-middle" icon="save" size={18} />
      </button>
      <button
        onClick={toggleHistory}
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3"
      >
        <MaterialSymbol className="align-middle" icon="history" size={18} />
      </button>
      <Link
        href="/settings/profile"
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3 rounded-r-lg"
      >
        <MaterialSymbol className="align-middle" icon="settings" size={18} />
      </Link>
      <div className="basis-1/5 place-self-center">
        <div className="pl-2">
          <UserButton />
        </div>
      </div>
    </div>
  );
}
