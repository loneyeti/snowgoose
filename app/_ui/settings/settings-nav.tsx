import Sidebar from "../sidebar";
import MenuListItem from "./menu-list-item";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";

export default function SettingsNav() {
  return (
    <Sidebar>
      <ul className="mt-6">
        <MenuListItem url="/settings/profile">
          <MaterialSymbol icon="face" size={18} className="mr-2 align-middle" />
          Profile
        </MenuListItem>
        <MenuListItem url="/settings/models">
          <MaterialSymbol
            icon="database"
            size={18}
            className="mr-2 align-middle"
          />
          Models
        </MenuListItem>
        <MenuListItem url="/settings/personas">
          <MaterialSymbol
            icon="smart_toy"
            size={18}
            className="mr-2 align-middle"
          />
          Personas
        </MenuListItem>
        <MenuListItem url="/settings/output-formats">
          <MaterialSymbol
            icon="speaker_notes"
            size={18}
            className="mr-2 align-middle"
          />
          Output Formats
        </MenuListItem>
        <MenuListItem url="/settings/history">
          <MaterialSymbol
            icon="history"
            size={18}
            className="mr-2 align-middle"
          />
          History
        </MenuListItem>
        <MenuListItem url="/settings/user-preferences">
          <MaterialSymbol
            icon="settings_account_box"
            size={18}
            className="mr-2 align-middle"
          />
          User Preferences
        </MenuListItem>
      </ul>
    </Sidebar>
  );
}
