import { deletePersona } from "@/app/_lib/server_actions/persona.actions";
import { deleteModel } from "@/app/_lib/server_actions/model.actions";
import { deleteMcpTool } from "@/app/_lib/server_actions/mcp-tool.actions";
import { deleteHistory } from "@/app/_lib/server_actions/history.actions";
import { deleteOutputFormat } from "@/app/_lib/server_actions/output-format.actions";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import Link from "next/link";

type DeleteAction = (id: number) => Promise<void>;
export type ResourceType =
  | "personas"
  | "models"
  | "mcp-tools"
  | "output-formats"
  | "history";

interface ButtonProps {
  id: string;
}

export function DeleteButtonFactory({
  id,
  resourceType,
}: {
  id: string;
  resourceType: ResourceType;
}) {
  let deleteAction: DeleteAction;

  switch (resourceType) {
    case "personas":
      deleteAction = deletePersona;
      break;
    case "models":
      deleteAction = deleteModel;
      break;
    case "mcp-tools":
      deleteAction = deleteMcpTool;
      break;
    case "output-formats":
      deleteAction = deleteOutputFormat;
      break;
    case "history":
      deleteAction = deleteHistory;
      break;
  }
  const deleteWithId = deleteAction.bind(null, Number(id));

  return (
    <div className="w-full flex justify-end">
      <form action={deleteWithId}>
        <button>
          {" "}
          <MaterialSymbol
            icon="delete"
            size={18}
            className="text-slate-500 hover:text-slate-700 transition-colors p-3 hover:rounded-md hover:bg-slate-100"
          />
        </button>
      </form>
    </div>
  );
}

export function EditButtonFactory({
  id,
  resourceType,
}: {
  id: string;
  resourceType: ResourceType;
}) {
  const path =
    resourceType === "history"
      ? `/settings/${resourceType}`
      : `/settings/${resourceType}/${id}/edit`;

  return (
    <div className="w-full flex justify-end">
      <Link href={path}>
        <button>
          {" "}
          <MaterialSymbol
            icon="edit"
            size={18}
            className="text-slate-500 hover:text-slate-700 transition-colors p-3 hover:rounded-md hover:bg-slate-100"
          />
        </button>
      </Link>
    </div>
  );
}

export function DeletePersonaButton({ id }: ButtonProps) {
  return <DeleteButtonFactory id={id} resourceType="personas" />;
}

export function EditPersonaButton({ id }: ButtonProps) {
  return <EditButtonFactory id={id} resourceType="personas" />;
}

export function EditOutputFormatButton({ id }: ButtonProps) {
  return <EditButtonFactory id={id} resourceType="output-formats" />;
}

export function DeleteOutputFormatButton({ id }: ButtonProps) {
  return <DeleteButtonFactory id={id} resourceType="output-formats" />;
}

export function EditModelButton({ id }: ButtonProps) {
  return <EditButtonFactory id={id} resourceType="models" />;
}

export function DeleteModelButton({ id }: ButtonProps) {
  return <DeleteButtonFactory id={id} resourceType="models" />;
}

export function DeleteHistoryButton({ id }: ButtonProps) {
  return <DeleteButtonFactory id={id} resourceType="history" />;
}

export function EditMCPToolButton({ id }: ButtonProps) {
  return <EditButtonFactory id={id} resourceType="mcp-tools" />;
}

export function DeleteMCPToolButton({ id }: ButtonProps) {
  return <DeleteButtonFactory id={id} resourceType="mcp-tools" />;
}
