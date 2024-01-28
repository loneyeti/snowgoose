import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { Chat } from "../lib/model";
import { saveChat } from "../lib/api";

export default function UtilityIconRow({
  resetChat,
  chat,
}: {
  resetChat: () => void;
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
      <form
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3"
        action={saveChatAction}
      >
        <button>
          <MaterialSymbol className="align-middle" icon="save" size={18} />
        </button>
      </form>
      <Link
        href="/settings/profile"
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3"
      >
        <MaterialSymbol className="align-middle" icon="history" size={18} />
      </Link>
      <Link
        href="/settings/profile"
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3"
      >
        <MaterialSymbol className="align-middle" icon="settings" size={18} />
      </Link>
      <Link
        href="/settings/profile"
        className="basis-1/5 text-slate-500 bg-slate-200 hover:bg-slate-300 text-center p-3 rounded-r-lg"
      >
        <MaterialSymbol className="align-middle" icon="logout" size={18} />
      </Link>
    </div>
  );
}
