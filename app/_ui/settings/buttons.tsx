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
          {/* Dark mode: Adjust icon color and hover styles */}
          <MaterialSymbol
            icon="delete"
            size={18}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-3 hover:rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          />
        </button>
      </form>
    </div>
  );
}

export function EditButtonFactory({
  id,
  resourceType,
  className, // Add className prop
  iconSize, // Add iconSize prop
}: {
  id: string;
  resourceType: ResourceType;
  className?: string; // Make className optional
  iconSize?: number; // Make iconSize optional
}) {
  const path =
    resourceType === "history"
      ? `/chat/settings/${resourceType}` // History doesn't have an edit page, link to list
      : `/chat/settings/${resourceType}/${id}/edit`;

  // Default className if not provided
  const buttonClassName =
    className ||
    "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-3 hover:rounded-md hover:bg-slate-100 dark:hover:bg-slate-700";

  return (
    // Removed the wrapping div to allow direct placement/styling by parent
    <Link href={path} passHref legacyBehavior>
      {/* Apply passed className to the button */}
      <a className={buttonClassName} aria-label={`Edit item ${id}`}>
        <MaterialSymbol
          icon="edit"
          size={iconSize || 18} // Use passed iconSize or default to 18
          // Removed className here as it's now controlled by the button's className
        />
      </a>
    </Link>
    // Removed the stray closing div tag
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
