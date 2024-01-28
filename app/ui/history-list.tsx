import { History } from "@/app/lib/model";
import { fetchHistory } from "@/app/lib/api";

export default async function HistoryList() {
  const histories = await fetchHistory();

  return (
    <div>
      {histories.map((history: History) => {
        return <p key={history.id}>{history.title}</p>;
      })}
    </div>
  );
}
