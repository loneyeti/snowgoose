import { z } from "zod";

export const CreatePersonaFormSchema = z.object({
  name: z.string(),
  prompt: z.string(),
  ownerId: z.null(),
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
  ownerId: z.null(),
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
});

export const UpdateModelFormSchema = z.object({
  id: z.coerce.number(),
  apiName: z.string(),
  name: z.string(),
  isVision: z.boolean(),
  isImageGeneration: z.boolean(),
  isThinking: z.boolean().default(false),
  apiVendorId: z.coerce.number(),
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
