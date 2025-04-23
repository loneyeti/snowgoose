"use server";

import { z } from "zod";
import { ContactFormSchema, FormState } from "../form-schemas";
import { getCurrentAPIUser } from "../auth"; // Use the correct utility
import { User } from "@prisma/client";
import { redirect } from "next/navigation"; // Import redirect

// Define the expected input structure for the action, including hidden fields
const ActionInputSchema = ContactFormSchema.extend({
  userId: z.string(), // Expect userId as a string from the form
  userEmail: z.string().email(), // Expect userEmail as a string from the form
});

export async function sendContactEmailAction(
  previousState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const currentUser = await getCurrentAPIUser(); // Fetch the DB user record

  if (!currentUser) {
    return { error: "Authentication error. Please log in again." };
  }

  // Validate form data using the extended schema
  const validatedFields = ActionInputSchema.safeParse({
    topic: formData.get("topic"),
    message: formData.get("message"),
    userId: formData.get("userId"), // Get hidden field value
    userEmail: formData.get("userEmail"), // Get read-only field value
  });

  // If form validation fails, return errors early.
  if (!validatedFields.success) {
    console.error(
      "Validation Errors:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: "Please correct the errors in the form.",
    };
  }

  // Double-check that the userId and email from the form match the logged-in user
  // This is a security measure against tampering with hidden/read-only fields
  // Compare against the Prisma User object properties
  if (
    validatedFields.data.userId !== currentUser.id.toString() || // Compare form string ID to DB number ID (converted to string)
    validatedFields.data.userEmail !== currentUser.email
  ) {
    console.error(
      "User ID or Email mismatch detected.",
      `Form: ${validatedFields.data.userId} / ${validatedFields.data.userEmail}`,
      `DB: ${currentUser.id} / ${currentUser.email}`
    );
    return { error: "User data mismatch. Please try again." };
  }

  try {
    // Prepare data for the API route
    const payload = {
      topic: validatedFields.data.topic,
      message: validatedFields.data.message,
      userId: validatedFields.data.userId, // Send validated ID
      userEmail: validatedFields.data.userEmail, // Send validated email
    };

    console.log("Sending contact email payload:", payload);

    // Construct the absolute URL for the API route
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_BASE_URL environment variable is not set.");
      return {
        error: "Application configuration error. Please contact support.",
      };
    }

    let apiUrl: URL;
    try {
      // Ensure the base URL is valid and combine it with the API path
      apiUrl = new URL("/api/resend", baseUrl);
    } catch (urlError) {
      console.error("Invalid NEXT_PUBLIC_BASE_URL:", baseUrl, urlError);
      return {
        error:
          "Application configuration error (Invalid URL). Please contact support.",
      };
    }

    // Call the API route using the absolute URL
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(errorData.error || "Failed to send message via API.");
    }

    const result = await response.json();
    console.log("API Success Response:", result);

    // Redirect to success page instead of returning state
    redirect("/contact/success");
  } catch (error: any) {
    // Check if the error is the specific NEXT_REDIRECT error
    if (error.digest?.startsWith("NEXT_REDIRECT;")) {
      // If it is, re-throw it so Next.js can handle the redirect
      throw error;
    }
    // Otherwise, it's a real error
    console.error("Error sending contact email:", error);
    // Return error state
    return { error: error.message || "An unexpected error occurred." };
  }
}
