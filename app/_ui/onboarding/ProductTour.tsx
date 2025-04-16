"use client";

import React, { useState, useCallback, useEffect } from "react"; // Import useEffect
import Joyride, {
  Step,
  CallBackProps,
  EVENTS,
  ACTIONS,
  STATUS,
} from "react-joyride";
import { completeOnboardingAction } from "@/app/_lib/server_actions/user.actions"; // Adjust path if needed

interface ProductTourProps {
  runTour: boolean;
  userId: number;
}

const ProductTour: React.FC<ProductTourProps> = ({ runTour, userId }) => {
  const [isMounted, setIsMounted] = useState(false); // State to track client mount

  // Set mounted state only on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define the tour steps
  const steps: Step[] = [
    {
      target: '[data-testid="onboarding-options-bar"]',
      content:
        "Select an AI model and a persona. Personas focus the AI on a specific task.",
      placement: "bottom",
      disableBeacon: true, // Start immediately without a beacon
    },
    {
      target: '[data-testid="onboarding-chat-input"]',
      content:
        "This is where you type your messages to the AI. If the model supports image input, you can also upload an image here.",
      placement: "top",
    },
    {
      target: '[data-testid="onboarding-save"]',
      content: "If you'd like to save your conversation, you can.",
      placement: "bottom",
    },
    {
      target: '[data-testid="onboarding-show-history"]',
      content: "Show your saved conversations.",
      placement: "bottom",
    },
    {
      target: '[data-testid="onboarding-show-settings"]',
      content:
        "Click here to get to additional settings and to manage past conversations and user personas",
      placement: "bottom",
    },
  ];

  // Callback function to handle tour events
  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      // Check if the tour has finished or been skipped using explicit comparisons
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        // Mark onboarding as complete
        console.log(
          "Onboarding tour finished or skipped. Marking as complete."
        );
        completeOnboardingAction(userId)
          .then((result) => {
            if (!result.success) {
              console.error("Failed to save onboarding status:", result.error);
              // Optionally show a user-facing error message here
            }
          })
          .catch((error) => {
            console.error("Error calling completeOnboardingAction:", error);
            // Optionally show a user-facing error message here
          });
        // Check specific event types using explicit comparisons
      } else if (
        type === EVENTS.STEP_AFTER ||
        type === EVENTS.TARGET_NOT_FOUND
      ) {
        // You can add logic here if needed, e.g., for specific steps
        console.log(`Joyride event: ${type} at index ${index}`);
      }
    },
    [userId] // Dependency array includes userId
  );

  // Basic styling to better match Tailwind dark/light themes
  // These can be further customized
  const joyrideStyles = {
    options: {
      arrowColor: "#fff", // White arrow for dark tooltip
      backgroundColor: "#1f2937", // Dark background (slate-800)
      primaryColor: "#3b82f6", // Blue-500 for buttons
      textColor: "#f1f5f9", // Light text (slate-100)
      zIndex: 1000,
    },
    buttonClose: {
      color: "#9ca3af", // Gray-400
    },
    buttonNext: {
      backgroundColor: "#3b82f6", // Blue-500
    },
    buttonBack: {
      color: "#9ca3af", // Gray-400
    },
    buttonSkip: {
      color: "#9ca3af", // Gray-400
    },
    tooltipContainer: {
      textAlign: "left" as const, // Ensure type compatibility
    },
  };

  // Only render Joyride on the client after mount and if runTour is true
  if (!isMounted || !runTour) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={true} // Always run if rendered (controlled by isMounted && runTour)
      callback={handleJoyrideCallback}
      continuous={true} // Go through steps sequentially
      showProgress={true} // Show step progress (e.g., 2/4)
      showSkipButton={true} // Allow users to skip the tour
      disableOverlayClose={true} // Prevent closing by clicking overlay
      styles={joyrideStyles} // Apply custom styles
      // debug={true} // Uncomment for debugging positioning/steps
    />
  );
};

export default ProductTour;
