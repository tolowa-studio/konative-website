import { z } from "zod";

const voiceAnswerSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  organization: z.string().optional(),
  phone: z.string().optional(),
  serviceAddresses: z.string().optional(),
  bandwidth: z.string().optional(),
  readyForService: z.string().optional(),
  fundingProgram: z.string().optional(),
  role: z.string().optional(),
  projectType: z.string().optional(),
  projectStage: z.string().optional(),
  // Tribal carrier-availability check (/tribal/carrier-check) — see CarrierCheckForm.tsx
  location: z.string().optional(),
  siteCount: z.string().optional(),
  needs: z.string().optional(),
  message: z.string().optional(),
  referralSource: z.string().optional(),
  audience: z.string().optional(),
  // Voice intake widget (homepage) — see VoiceIntakeWidget.tsx
  context: z.string().optional(),
  voiceMarkdown: z.string().optional(),
  voiceAnswers: z.array(voiceAnswerSchema).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
