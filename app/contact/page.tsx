import { getCurrentAPIUser } from "../_lib/auth";
import ContactForm from "../_ui/contact/contact-form"; // We will create this next
import { redirect } from "next/navigation";
// Removed incorrect typography import

export default async function ContactPage() {
  const user = await getCurrentAPIUser();

  if (!user) {
    // Redirect to login if user is not authenticated
    // Alternatively, show a message asking them to log in
    redirect("/login?message=Please log in to contact support.");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Use standard HTML tags */}
      <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Contact Support
      </h1>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Have an issue, feedback, or a general question? Fill out the form below
        and we&apos;ll get back to you as soon as possible.{" "}
        {/* Fixed apostrophe */}
      </p>
      {/* Pass user details to the form, providing fallback for email */}
      <ContactForm userEmail={user.email ?? ""} userId={user.id} />
    </div>
  );
}
