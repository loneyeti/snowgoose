import {
  deletePersona,
  deleteOutputFormat,
  deleteHistory,
} from "@/app/lib/api";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";

export function DeletePersonaButton({ id }: { id: string }) {
  const deletePersonaWithId = deletePersona.bind(null, id);

  return (
    <div className="w-full flex justify-end">
      <form action={deletePersonaWithId}>
        <button className="mt-3">
          {" "}
          <MaterialSymbol icon="delete" size={18} className="" />
        </button>
      </form>
    </div>
  );
}

export function DeleteOutputFormatButton({ id }: { id: string }) {
  const deleteOutputFormatWithId = deleteOutputFormat.bind(null, id);

  return (
    <div className="w-full flex justify-end">
      <form action={deleteOutputFormatWithId}>
        <button className="mt-3">
          {" "}
          <MaterialSymbol icon="delete" size={18} className="" />
        </button>
      </form>
    </div>
  );
}

export function DeleteHistoryButton({ id }: { id: string }) {
  const deleteHistoryWithId = deleteHistory.bind(null, id);

  return (
    <div className="w-full flex justify-end">
      <form action={deleteHistoryWithId}>
        <button className="mt-3">
          {" "}
          <MaterialSymbol icon="delete" size={18} className="" />
        </button>
      </form>
    </div>
  );
}
