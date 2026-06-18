import { ZodSchema } from "zod";
import { getSanityWriteClient } from "@/sanity/writeClient";

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; errors: { path: string; message: string }[]; message?: undefined }
  | { ok: false; errors?: undefined; message: string };

export interface SubmitOptions<T> {
  schemaType: string;
  zodSchema: ZodSchema<T>;
  payload: unknown;
  emailSubject: string;
  emailHtml?: string;
}

/** Validate → persist to Sanity → notify the owner and CRM automation. */
export async function submitForm<T extends Record<string, unknown>>(
  options: SubmitOptions<T>,
): Promise<SubmitResult> {
  const { schemaType, zodSchema, payload, emailSubject, emailHtml } = options;

  // 1. Validate
  const parsed = zodSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(e => ({
        path: e.path.join("."),
        message: e.message,
      })),
    };
  }

  // 2. Persist to Sanity — always first, source of truth
  let docId: string;
  try {
    const client = getSanityWriteClient();
    const doc = await client.create({
      _type: schemaType,
      ...(parsed.data as Record<string, unknown>),
      submittedAt: new Date().toISOString(),
    });
    docId = doc._id;
  } catch (err) {
    console.error(`[submitForm] Sanity write failed for ${schemaType}:`, err);
    return {
      ok: false,
      message: "Failed to save submission. Please try again.",
    };
  }

  // 3. Notify via Resend — non-blocking, loud-fail in logs only
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO || "jeramey.james@gmail.com";
  const from = process.env.RESEND_FROM || "Konative <team@konative.com>";

  if (!apiKey) {
    console.warn(
      `[submitForm] RESEND_API_KEY not set — skipping email for ${schemaType} (doc ${docId})`,
    );
  } else {
    const html =
      emailHtml ||
      `<h2>${emailSubject}</h2><pre>${JSON.stringify(parsed.data, null, 2)}</pre><p>Sanity doc: ${docId}</p>`;
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: emailSubject, html }),
    }).catch(err => console.error(`[submitForm] Resend error for ${schemaType}:`, err));
  }

  // 4. Forward to Twenty/n8n when configured. Keep the public form successful
  // when the automation layer is temporarily unavailable; Sanity remains the
  // durable intake record and the webhook can be replayed from there.
  const crmWebhookUrl =
    process.env.TWENTY_INTAKE_WEBHOOK_URL || process.env.INQUIRY_WEBHOOK_URL;
  if (!crmWebhookUrl) {
    console.warn(
      `[submitForm] CRM intake webhook not set — ${schemaType} remains in Sanity (doc ${docId})`,
    );
  } else {
    fetch(crmWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.TWENTY_INTAKE_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.TWENTY_INTAKE_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        source: "konative.com",
        schemaType,
        sanityDocumentId: docId,
        submittedAt: new Date().toISOString(),
        data: parsed.data,
      }),
    }).catch(err =>
      console.error(`[submitForm] CRM webhook error for ${schemaType}:`, err),
    );
  }

  return { ok: true, id: docId };
}
