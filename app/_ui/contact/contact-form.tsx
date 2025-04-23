"use client";

import { useForm } from "react-hook-form"; // Keep useForm from react-hook-form
import { useFormState } from "react-dom"; // Import useFormState from react-dom for actions
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactFormSchema, FormState } from "../../_lib/form-schemas";
import { sendContactEmailAction } from "../../_lib/server_actions/contact.actions";
import { useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "../settings/buttons"; // Assuming a reusable SubmitButton exists

// Define the shape of the form data based on the Zod schema
type FormData = Zod.infer<typeof ContactFormSchema>;

export default function ContactForm({
  userEmail,
  userId,
}: {
  userEmail: string;
  userId: number; // User ID from DB is number
}) {
  // useFormState hook from react-dom to manage form state and actions
  const [state, formAction] = useFormState(
    sendContactEmailAction, // Pass the server action
    undefined // Initial state
  );

  // useForm hook for form handling and validation
  const {
    register,
    handleSubmit,
    reset, // Function to reset form fields
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(ContactFormSchema), // Use Zod for validation
    defaultValues: {
      topic: undefined, // Default to no selection
      message: "",
    },
  });

  // Effect to show toast messages for errors
  useEffect(() => {
    // Only handle errors here, success is handled by redirect
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]); // Remove reset from dependencies as it's no longer called here

  return (
    <form action={formAction} className="space-y-6">
      {/* Read-only User Email */}
      <div>
        <label
          htmlFor="userEmail"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Your Email (Read-only)
        </label>
        <input
          id="userEmail"
          name="userEmail" // Name matches the server action expectation
          type="email"
          value={userEmail}
          readOnly
          className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-slate-500 dark:text-slate-400"
        />
      </div>

      {/* Hidden User ID - No need to register with react-hook-form */}
      <input
        type="hidden"
        name="userId" // Name is needed for formData.get() in action
        value={userId.toString()} // Pass userId as string
      />

      {/* Topic Selection */}
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Topic
        </label>
        <select
          id="topic"
          {...register("topic")}
          className={`mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 ${
            errors.topic ? "border-red-500" : ""
          }`}
          defaultValue="" // Add a default empty value for the placeholder
        >
          <option value="" disabled>
            Select a topic...
          </option>
          <option value="Issue">Issue</option>
          <option value="Feedback">Feedback</option>
          <option value="General Inquiry">General Inquiry</option>
        </select>
        {errors.topic && (
          <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
        )}
        {/* Display server-side validation error for topic */}
        {state?.fieldErrors?.topic && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.topic.join(", ")}
          </p>
        )}
      </div>

      {/* Message Textarea */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Message
        </label>
        <textarea
          id="message"
          {...register("message")}
          rows={4}
          className={`mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 ${
            errors.message ? "border-red-500" : ""
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
        {/* Display server-side validation error for message */}
        {state?.fieldErrors?.message && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.message.join(", ")}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <SubmitButton isSubmitting={isSubmitting}>Send Message</SubmitButton>
      </div>

      {/* Display general server-side errors */}
      {state?.error && !state.fieldErrors && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      {/* Display success message (alternative to toast) */}
      {/* {state?.success && <p className="mt-2 text-sm text-green-600">{state.message}</p>} */}
    </form>
  );
}
