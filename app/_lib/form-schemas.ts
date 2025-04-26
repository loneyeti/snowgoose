import { z } from "zod";

export type FormState = {
  error?: string; // General user-facing error message
  fieldErrors?: Record<string, string[] | undefined>; // Zod validation errors
  success?: boolean;
  message?: string; // Optional success/info message
};

export const CreatePersonaFormSchema = z.object({
  name: z.string(),
  prompt: z.string(),
  ownerId: z.coerce.number().nullable(),
});

export const createCheckoutSessionFormSchema = z.object({
  priceId: z.string(),
});

export const CreateOutputFormatFormSchema = z.object({
  name: z.string(),
  prompt: z.string(),
  renderTypeId: z.coerce.number(),
});

export const UpdatePersonaFormSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  prompt: z.string(),
  ownerId: z.coerce.number().nullable(),
});

export const UpdateOutputFormatFormSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  prompt: z.string(),
  renderTypeId: z.coerce.number(),
  ownerId: z.null(),
});

export const CreateModelFormSchema = z.object({
  apiName: z.string(),
  name: z.string(),
  isVision: z.boolean().default(false),
  isImageGeneration: z.boolean().default(false),
  isThinking: z.boolean().default(false),
  apiVendorId: z.coerce.number(),
  inputTokenCost: z.coerce.number().optional().nullable(),
  outputTokenCost: z.coerce.number().optional().nullable(),
  paidOnly: z.boolean().default(false), // Added paidOnly field
});

export const UpdateModelFormSchema = z.object({
  id: z.coerce.number(),
  apiName: z.string(),
  name: z.string(),
  isVision: z.boolean(),
  isImageGeneration: z.boolean(),
  isThinking: z.boolean().default(false),
  apiVendorId: z.coerce.number(),
  inputTokenCost: z.coerce.number().optional().nullable(),
  outputTokenCost: z.coerce.number().optional().nullable(),
  paidOnly: z.boolean(), // Added paidOnly field
});

export const UpdateUserSettingsSchema = z.object({
  id: z.coerce.number(),
  appearanceMode: z.string().optional(),
  summaryModelPreferenceId: z.number().optional(),
});

export const CreateMCPToolFormSchema = z.object({
  name: z.string(),
  path: z.string(),
});

export const UpdateMCPToolFormSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  path: z.string(),
});

export const CreateUserFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string(),
  isAdmin: z.boolean().default(false),
});

export const UpdateUserFormSchema = z.object({
  id: z.coerce.number(),
  username: z.string(),
  password: z.string(),
  email: z.string(),
  isAdmin: z.boolean().default(false),
});

export const FormSchema = z.object({
  model: z.string(),
  personaId: z.coerce.number(),
  outputFormatId: z.coerce.number(),
  prompt: z.string(),
  maxTokens: z.coerce.number().nullable(),
  budgetTokens: z.coerce.number().nullable(),
  mcpTool: z.coerce.number(),
});

// Schema for validating the admin subscription plan upsert action
export const upsertSubscriptionPlanSchema = z.object({
  stripePriceId: z.string().min(1, "Stripe Price ID is required."),
  name: z.string().min(1, "Plan name is required."),
  // Ensure usageLimit is treated as a number, coercing if necessary
  usageLimit: z.coerce
    .number({
      invalid_type_error: "Usage limit must be a number.",
      required_error: "Usage limit is required.",
    })
    .positive("Usage limit must be a positive number."),
});

export const ContactFormSchema = z.object({
  topic: z.enum(["Issue", "Feedback", "General Inquiry"], {
    required_error: "Please select a topic.",
  }),
  message: z.string().min(10, "Message must be at least 10 characters long."),
  // userId and userEmail will be added server-side or via hidden/read-only fields,
  // so they don't need explicit client-side validation here unless required by the form structure.
  // We'll handle getting these values in the component/action.
});
