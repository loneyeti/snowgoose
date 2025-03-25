import clsx from "clsx";
import { MaterialSymbol } from "react-material-symbols";

export default function SelectBox({
  children,
  name,
  disableSelection,
  defaultValue,
  hide,
  onChangeFunction,
}: {
  children: React.ReactNode;
  name: string;
  disableSelection: boolean;
  defaultValue: string | number;
  hide: boolean;
  onChangeFunction?: (event: React.ChangeEvent) => void | undefined;
}) {
  return (
    <div className="relative">
      <select
        className={clsx(
          `block bg-transparent bg-none w-full pl-0 pr-6 text-sm font-medium border-0 focus:ring-0 focus:outline-none appearance-none cursor-pointer`,
          {
            "touch-none pointer-events-none text-slate-400":
              disableSelection === true,
          },
          {
            hidden: hide === true,
          }
        )}
        id={name}
        name={name}
        defaultValue={defaultValue}
        key={defaultValue}
        disabled={hide}
        onChange={onChangeFunction}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
        <MaterialSymbol
          icon="expand_more"
          size={16}
          className={clsx("text-slate-500", {
            "text-slate-300": disableSelection === true,
          })}
        />
      </div>
    </div>
  );
}
