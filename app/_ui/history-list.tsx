import { ConversationHistory } from "@prisma/client";
import { getHistory } from "../_lib/server_actions/history.actions";
import { DeleteHistoryButton } from "./settings/buttons";
import { getUserID } from "../_lib/auth";

export default async function HistoryList() {
  const userId = await getUserID();
  const histories = await getHistory(userId);

  return (
    <div>
      {histories.map((history: ConversationHistory) => {
        return (
          <div
            className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50"
            key={history.id}
          >
            <p className="text-sm ml-6 text-slate-600">{history.title}</p>
            <div>
              <DeleteHistoryButton id={`${history.id}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
