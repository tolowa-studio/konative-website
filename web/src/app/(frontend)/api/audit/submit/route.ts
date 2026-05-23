import { NextResponse } from "next/server";
import { submitForm } from "@/lib/forms/submit";
import { auditInquirySchema } from "@/lib/forms/schemas/audit";

// R4 Readiness Audit inquiries land in Sanity as `auditInquiry` docs and
// email the team via Resend. See STRATEGY.md B12 (Concierge to product).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, string>;
  const result = await submitForm({
    schemaType: "auditInquiry",
    zodSchema: auditInquirySchema,
    payload: body,
    emailSubject: `[Konative] Readiness Audit inquiry — ${b?.organization ?? "?"} (${b?.audience ?? "?"})`,
  });

  if (!result.ok) {
    if (result.errors) {
      return NextResponse.json(
        { error: "Validation failed", errors: result.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: result.message ?? "Submission failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true, id: result.id });
}
