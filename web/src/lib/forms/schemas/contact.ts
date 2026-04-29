import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  organization: z.string().min(1, "Organization is required"),
  role: z.string().optional(),
  projectType: z.string().optional(),
  projectStage: z.string().optional(),
  message: z.string().optional(),
  referralSource: z.string().optional(),
  audience: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
