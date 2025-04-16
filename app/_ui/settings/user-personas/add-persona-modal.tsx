"use client";

import Modal from "@/app/_ui/modal";
import AddPersonaForm from "./add-persona-form";

interface AddPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPersonaModal({
  isOpen,
  onClose,
}: AddPersonaModalProps) {
  // Handle successful form submission by closing the modal
  const handleSuccess = () => {
    onClose();
    // Data revalidation should happen automatically if the server action
    // uses revalidatePath or revalidateTag correctly.
    // If not, you might need to trigger a refresh or re-fetch here.
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User Persona">
      <AddPersonaForm onSuccess={handleSuccess} />
    </Modal>
  );
}
