import { z } from "zod";

/** R4 Readiness Audit inquiry — feeds the /readiness-audit landing page. */
export const auditInquirySchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  organization: z.string().min(1, "Organization required"),
  role: z.string().optional(),
  phone: z.string().optional(),
  audience: z
    .enum(["landowner", "developer", "investor", "operator", "other"])
    .optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  acreage: z.string().optional(),
  power_context: z.string().optional(),
  timeline: z
    .enum(["this_quarter", "this_year", "12_months_plus", "exploratory"])
    .optional(),
  notes: z.string().max(4000).optional(),
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
});

export type AuditInquiryFormData = z.infer<typeof auditInquirySchema>;
