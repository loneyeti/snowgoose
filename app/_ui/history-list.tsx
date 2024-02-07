import { History } from "@/app/_lib/model";
import { fetchHistory } from "@/app/_lib/api";
import { DeleteHistoryButton } from "./settings/buttons";

export default async function HistoryList() {
  const histories = await fetchHistory();

  return (
    <div>
      {histories.map((history: History) => {
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
