import { Resend } from "resend";
import { z } from "zod"; // Import Zod

// Define Zod schema for the expected request body from the server action
const ResendPayloadSchema = z.object({
  topic: z.enum(["Issue", "Feedback", "General Inquiry"]),
  message: z.string().min(1), // Basic check, more detailed validation is in the action
  userId: z.string().min(1), // Expecting string ID from action
  userEmail: z.string().email(),
});

export async function POST(req: Request) {
  // Use App Router style: export async function POST(req: Request)
  try {
    // Ensure Resend API key is configured *before* parsing/validation
    if (!process.env.RESEND_API_KEY) {
      console.error("Resend API key is not configured.");
      return new Response(
        JSON.stringify({ error: "Internal server configuration error." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate request body using the Zod schema
    const validatedData = ResendPayloadSchema.safeParse(body);

    if (!validatedData.success) {
      console.error("API Validation Error:", validatedData.error.flatten());
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validatedData.error.flatten(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Destructure validated data
    const { topic, message, userId, userEmail } = validatedData.data;

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: "Snowgoose Contact Form <noreply@snowgoose.app>", // Use a verified domain for 'from'
      to: "support@snowgoose.app", // Target support email
      replyTo: userEmail, // Corrected: Set Reply-To to the actual user's email
      subject: `[${topic}] Contact Form Submission - User ID: ${userId}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <hr>
        <h2>Message:</h2>
        <p style="white-space: pre-wrap;">${message}</p> 
      `,
      // Provide a plain text version as well
      text: `New Contact Form Submission:\n\nUser ID: ${userId}\nUser Email: ${userEmail}\nTopic: ${topic}\n\nMessage:\n${message}`,
    });

    // Handle Resend API errors
    if (error) {
      console.error("Resend API Error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to send email.",
          details: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log success and return OK response
    console.log("Resend API Success:", data);
    return new Response(
      JSON.stringify({ ok: true, message: "Email sent successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Catch all other errors (e.g., JSON parsing)
    console.error("API Route Error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
