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
