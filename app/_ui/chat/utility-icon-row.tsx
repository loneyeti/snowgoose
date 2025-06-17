import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { toast } from "sonner";
import { Chat } from "../../_lib/model";
import { saveChat } from "../../_lib/server_actions/history.actions";
import { User } from "@prisma/client";
import { Menu, Transition } from "@headlessui/react"; // Import Headless UI components
import { Fragment } from "react"; // Import Fragment

export default function UtilityIconRow({
  resetChat,
  toggleHistory,
  user,
  chat,
  closePopover, // Add optional closePopover prop
}: {
  resetChat: () => void;
  toggleHistory: () => void;
  user: User;
  chat: Chat | undefined;
  closePopover?: () => void; // Make it optional
}) {
  async function saveChatAction() {
    try {
      if (chat) {
        const saveMessage = await saveChat(chat);
        toast.success(`Saved conversation: ${saveMessage}`);
      } else {
        console.error("No chat to save");
        toast.error("No conversation to save");
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      toast.error("Failed to save conversation");
    }
  }
  const initial = user.username.charAt(0).toUpperCase() ?? "";
  return (
    // Use flex-wrap, center on mobile, justify-end on larger screens. Add gap.
    <div className="flex flex-row flex-wrap justify-center sm:justify-end items-center gap-2">
      {/* Dark mode: Adjust icon colors and hover states. Removed basis-1/5, adjusted padding/rounding */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          resetChat();
        }}
        title="New Chat"
        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-md transition-colors inline-flex justify-center items-center"
      >
        <MaterialSymbol icon="add" size={24} />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          saveChatAction();
        }}
        title="Save Chat"
        data-testid="onboarding-save"
        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-md transition-colors inline-flex justify-center items-center"
      >
        <MaterialSymbol icon="save" size={24} />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleHistory();
          closePopover?.(); // Call closePopover if it exists
        }}
        title="Show History"
        data-testid="onboarding-show-history"
        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-md transition-colors inline-flex justify-center items-center"
      >
        <MaterialSymbol icon="history" size={24} />
      </button>
      {/* Removed the old direct Help Icon Link */}

      {/* Help Dropdown Menu */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          {/* Apply consistent styling to the dropdown button */}
          <Menu.Button
            title="Help"
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-md transition-colors inline-flex justify-center items-center"
          >
            <MaterialSymbol icon="help_outline" size={24} />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="https://docs.snowgoose.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${
                      active
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        : "text-slate-700 dark:text-slate-300"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <MaterialSymbol
                      icon="menu_book"
                      size={20}
                      className="mr-2"
                    />
                    Documentation
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/contact" // Link to the new contact page
                    className={`${
                      active
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        : "text-slate-700 dark:text-slate-300"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <MaterialSymbol
                      icon="contact_support"
                      size={20}
                      className="mr-2"
                    />
                    Contact Support
                  </Link>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <Link
        href="/chat/settings/profile"
        title="Settings"
        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-md transition-colors inline-flex justify-center items-center"
        data-testid="onboarding-show-settings"
      >
        <MaterialSymbol icon="settings" size={24} />
      </Link>
      {/* Profile Icon - Removed basis-1/5 and extra div */}
      {/* Dark mode: Adjust profile icon colors */}
      <Link
        href="/chat/settings/profile"
        title="Profile"
        className="flex items-center justify-center w-8 h-8 rounded-full mb-2 bg-slate-600 dark:bg-slate-500 text-white dark:text-slate-100 hover:bg-slate-700 dark:hover:bg-slate-400 transition-colors"
      >
        <span className="text-sm font-medium">{initial}</span>
      </Link>
      {/* Removed extra closing div from previous edit */}
    </div> // Added missing closing div
  );
}
