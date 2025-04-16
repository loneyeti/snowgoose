import { isCurrentUserAdmin } from "@/app/_lib/auth";
import Sidebar from "../sidebar";
import MenuListItem from "./menu-list-item";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";

export default async function SettingsNav() {
  const isUserAdmin = await isCurrentUserAdmin();
  return (
    <Sidebar>
      <ul className="mt-6 space-y-1">
        {/* General Settings */}
        <MenuListItem
          url="/chat/settings/profile"
          data-testid="onboarding-settings-link"
        >
          {" "}
          {/* Added for onboarding tour */}
          <MaterialSymbol icon="face" size={18} className="mr-2 align-middle" />
          Profile
        </MenuListItem>
        <MenuListItem url="/chat/settings/user-personas">
          <MaterialSymbol
            icon="person"
            size={18}
            className="mr-2 align-middle"
          />
          User Personas
        </MenuListItem>
        <MenuListItem url="/chat/settings/history">
          <MaterialSymbol
            icon="history"
            size={18}
            className="mr-2 align-middle"
          />
          History
        </MenuListItem>
        <MenuListItem url="/chat/settings/user-preferences">
          <MaterialSymbol icon="tune" size={18} className="mr-2 align-middle" />
          Preferences
        </MenuListItem>

        {/* Admin Settings Section */}
        {isUserAdmin && (
          <li className="pt-4">
            {/* Dark mode: Adjust admin section header text color */}
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Admin
            </div>
            <ul className="mt-1 space-y-1">
              <MenuListItem url="/chat/settings/users">
                <MaterialSymbol
                  icon="manage_accounts"
                  size={18}
                  className="mr-2 align-middle"
                />
                Users
              </MenuListItem>
              <MenuListItem url="/chat/settings/models">
                <MaterialSymbol
                  icon="database"
                  size={18}
                  className="mr-2 align-middle"
                />
                Models
              </MenuListItem>
              <MenuListItem url="/chat/settings/global-personas">
                <MaterialSymbol
                  icon="smart_toy"
                  size={18}
                  className="mr-2 align-middle"
                />
                Global Personas
              </MenuListItem>
              <MenuListItem url="/chat/settings/output-formats">
                <MaterialSymbol
                  icon="speaker_notes"
                  size={18}
                  className="mr-2 align-middle"
                />
                Output Formats
              </MenuListItem>
              <MenuListItem url="/chat/settings/mcp-tools">
                <MaterialSymbol
                  icon="construction"
                  size={18}
                  className="mr-2 align-middle"
                />
                MCP Tools
              </MenuListItem>
              {/* Add new link for Admin Subscription Management */}
              <MenuListItem url="/chat/settings/admin/subscriptions">
                <MaterialSymbol
                  icon="receipt_long" // Using receipt_long icon
                  size={18}
                  className="mr-2 align-middle"
                />
                Subscriptions
              </MenuListItem>
              {/* Add new link for Subscription Limits */}
              <MenuListItem url="/chat/settings/admin/subscription-limits">
                <MaterialSymbol
                  icon="rule" // Using rule icon for limits
                  size={18}
                  className="mr-2 align-middle"
                />
                Subscription Limits
              </MenuListItem>
            </ul>
          </li>
        )}
      </ul>
    </Sidebar>
  );
}
