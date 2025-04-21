"use client"; // Needs to be a client component for state

import { useState } from "react";
import { SettingsListSettings, SettingListProps } from "@/app/_lib/model";
import { EditButtonFactory } from "./buttons"; // Keep EditButtonFactory
import DeleteConfirmation from "./delete-confirmation"; // Import the refactored modal
import { deleteHistory } from "@/app/_lib/server_actions/history.actions"; // Import the specific delete action
import { deletePersona } from "@/app/_lib/server_actions/persona.actions";
import { deleteModel } from "@/app/_lib/server_actions/model.actions";
import { deleteMcpTool } from "@/app/_lib/server_actions/mcp-tool.actions";
import { deleteOutputFormat } from "@/app/_lib/server_actions/output-format.actions";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import clsx from "clsx"; // Import clsx for conditional classes if needed later

// Define the type for the item being deleted
interface ItemToDelete {
  id: number;
  title: string;
}

export default function SettingsList({
  settings,
}: {
  settings: SettingListProps;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);

  // Map resource type to the correct delete action
  const getDeleteAction = (resourceType: SettingListProps["resourceType"]) => {
    switch (resourceType) {
      case "personas":
        return deletePersona;
      case "models":
        return deleteModel;
      case "mcp-tools":
        return deleteMcpTool;
      case "output-formats":
        return deleteOutputFormat;
      case "history":
        return deleteHistory;
      default:
        // Provide a fallback or throw an error for unhandled types
        console.error("Unhandled resource type for deletion:", resourceType);
        return async (id: number) => {
          /* no-op */
        };
    }
  };

  const handleDeleteClick = (setting: SettingsListSettings) => {
    setItemToDelete({ id: setting.id, title: setting.title });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const deleteAction = getDeleteAction(settings.resourceType);
      try {
        await deleteAction(itemToDelete.id);
        // Optionally: Add success feedback (e.g., toast notification)
      } catch (error) {
        console.error("Failed to delete item:", error);
        // Optionally: Add error feedback
      } finally {
        setIsModalOpen(false);
        setItemToDelete(null);
      }
    }
  };

  return (
    <>
      {/* Replaced flexbox with a responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.settings.map((setting: SettingsListSettings) => {
          return (
            // Corrected card structure with modern styling
            <div
              key={setting.id}
              // Updated card styling: subtle shadow, refined padding, hover effect, transition
              className="p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md dark:shadow-slate-700/50 dark:hover:shadow-slate-600/50 transition-shadow duration-200 flex flex-col justify-between"
            >
              <div>
                {" "}
                {/* Wrapper for main content */}
                {/* Header row using flexbox to align title and actions */}
                <div className="flex justify-between items-start mb-4">
                  {/* Updated title styling: font-medium, removed min-height */}
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 line-clamp-3 mr-4">
                    {setting.title}
                  </h2>
                  {/* Actions container: always visible, flex layout, spacing */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {/* Delete Button: updated styling, added aria-label */}
                    <button
                      onClick={() => handleDeleteClick(setting)}
                      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      aria-label={`Delete ${setting.title}`}
                    >
                      <MaterialSymbol icon="delete" size={18} />
                    </button>
                    {/* Edit Button: Pass className for consistent styling */}
                    {!settings.hideEdit && (
                      <EditButtonFactory
                        id={`${setting.id}`}
                        resourceType={settings.resourceType}
                        // Pass className and iconSize props for consistent styling
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        iconSize={18}
                      />
                    )}
                  </div>
                </div>
                {/* Optional: Placeholder for setting.detail or other content */}
                {/* {setting.detail && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                    {setting.detail}
                  </p>
                )} */}
              </div>
              {/* Optional: Add a footer section here if needed */}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.title} // Pass the title for clarity
      />
    </>
  );
}
