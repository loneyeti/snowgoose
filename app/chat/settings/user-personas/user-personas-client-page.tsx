"use client";

import { useState, Suspense } from "react";
import { SettingsHeading } from "@/app/_ui/typography";
import { Button } from "@/app/_ui/button";
import SettingsList from "@/app/_ui/settings/settings-list";
import AddPersonaModal from "@/app/_ui/settings/user-personas/add-persona-modal";
import { SettingListProps } from "@/app/_lib/model";
import ListSkeleton from "@/app/_ui/settings/list-skeleton";

interface UserPersonasClientPageProps {
  settingsListProps: SettingListProps;
}

export default function UserPersonasClientPage({
  settingsListProps,
}: UserPersonasClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <SettingsHeading>User Personas</SettingsHeading>
        <Button variant="primary" onClick={openModal}>
          Add User Persona
        </Button>
      </div>

      {/* Suspense might still be useful if SettingsList itself fetches more data */}
      <Suspense
        fallback={
          <>
            <ListSkeleton />
            <ListSkeleton />
            <ListSkeleton />
          </>
        }
      >
        <SettingsList settings={settingsListProps} />
      </Suspense>

      <AddPersonaModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
