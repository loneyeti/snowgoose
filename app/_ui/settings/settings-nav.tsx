import { isCurrentUserAdmin } from "@/app/_lib/auth";
import Sidebar from "../sidebar";
import MenuListItem from "./menu-list-item";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";

export default async function SettingsNav() {
  const isUserAdmin = await isCurrentUserAdmin();
  return (
    <Sidebar>
      <ul className="mt-6">
        <MenuListItem url="/settings/profile">
          <MaterialSymbol icon="face" size={18} className="mr-2 align-middle" />
          Profile
        </MenuListItem>
        {isUserAdmin && (
          <>
            <MenuListItem url="/settings/users">
              <MaterialSymbol
                icon="manage_accounts"
                size={18}
                className="mr-2 align-middle"
              />
              Users
            </MenuListItem>
            <MenuListItem url="/settings/models">
              <MaterialSymbol
                icon="database"
                size={18}
                className="mr-2 align-middle"
              />
              Models
            </MenuListItem>
          </>
        )}
        {isUserAdmin && (
          <MenuListItem url="/settings/global-personas">
            <MaterialSymbol
              icon="smart_toy"
              size={18}
              className="mr-2 align-middle"
            />
            Global Personas
          </MenuListItem>
        )}
        <MenuListItem url="/settings/user-personas">
          <MaterialSymbol
            icon="person"
            size={18}
            className="mr-2 align-middle"
          />
          User Personas
        </MenuListItem>
        {isUserAdmin && (
          <MenuListItem url="/settings/output-formats">
            <MaterialSymbol
              icon="speaker_notes"
              size={18}
              className="mr-2 align-middle"
            />
            Output Formats
          </MenuListItem>
        )}
        {isUserAdmin && (
          <MenuListItem url="/settings/mcp-tools">
            <MaterialSymbol
              icon="construction"
              size={18}
              className="mr-2 align-middle"
            />
            MCP Tools
          </MenuListItem>
        )}
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
