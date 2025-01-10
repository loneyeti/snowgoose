import { z } from "zod";

export const CreatePersonaFormSchema = z.object({
  name: z.string(),
  prompt: z.string(),
});

export const CreateOutputFormatFormSchema = z.object({
  name: z.string(),
  prompt: z.string(),
  render_type_id: z.coerce.number(),
});

export const UpdatePersonaFormSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  prompt: z.string(),
});

export const UpdateOutputFormatFormSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  prompt: z.string(),
  render_type_id: z.coerce.number(),
});

export const CreateModelFormSchema = z.object({
  api_name: z.string(),
  name: z.string(),
  is_vision: z.boolean().default(false),
  is_image_generation: z.boolean().default(false),
  api_vendor_id: z.coerce.number(),
});

export const UpdateModelFormSchema = z.object({
  id: z.coerce.number(),
  api_name: z.string(),
  name: z.string(),
  is_vision: z.boolean(),
  is_image_generation: z.boolean(),
  api_vendor_id: z.coerce.number(),
});

export const UpdateUserSettingsSchema = z.object({
  id: z.coerce.number(),
  appearance_mode: z.string().optional(),
  summary_model_preference_id: z.number().optional(),
});