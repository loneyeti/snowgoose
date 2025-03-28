import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Chat, ChatResponse } from "@/app/_lib/model";
import { createChat } from "@/app/_lib/server_actions/chat-actions";

interface FormSubmissionState {
  isSubmitting: boolean;
  data: FormData | null;
}

interface UseFormSubmissionProps {
  responseHistory: ChatResponse[];
  updateMessage: (chat: Chat | undefined) => void;
  updateShowSpinner: (show: boolean) => void;
}

export function useFormSubmission({
  responseHistory,
  updateMessage,
  updateShowSpinner,
}: UseFormSubmissionProps): FormSubmissionState & {
  handleSubmit: (formData: FormData) => void;
  handleReset: () => void;
} {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<FormData | null>(null);
  const router = useRouter();
  // Add a ref to track if a submission is in progress to prevent double submissions
  const submissionInProgress = useRef(false);

  useEffect(() => {
    const submitForm = async () => {
      if (!isSubmitting || !data || submissionInProgress.current) return;

      // Set flag to prevent double submissions
      submissionInProgress.current = true;

      try {
        updateShowSpinner(true);

        const chat = await createChat(data, responseHistory);
        updateMessage(chat);

        // Reset form state
        updateShowSpinner(false);
        setIsSubmitting(false);
      } catch (error) {
        console.error("Error during form submission:", error);
        updateShowSpinner(false);
        setIsSubmitting(false);
        toast.error("Error retrieving data");
      } finally {
        // Reset the flag regardless of success or failure
        submissionInProgress.current = false;
      }
    };

    if (isSubmitting) {
      submitForm();
    }
  }, [isSubmitting, data, responseHistory, updateMessage, updateShowSpinner]);

  // Prevent multiple rapid submissions
  const handleSubmit = (formData: FormData) => {
    if (submissionInProgress.current || isSubmitting) {
      // Submission already in progress, ignoring duplicate
      return;
    }

    setData(formData);
    setIsSubmitting(true);
  };

  const handleReset = () => {
    updateMessage(undefined);
    router.refresh();
  };

  return {
    isSubmitting,
    data,
    handleSubmit,
    handleReset,
  };
}
