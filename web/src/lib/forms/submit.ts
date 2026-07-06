import { ZodSchema } from "zod";
import { after } from "next/server";
import { getSanityWriteClient } from "@/sanity/writeClient";
import { scoreInquiry, type TriageResult } from "@/lib/forms/triage";

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

  // 3. Triage — pure, non-throwing scoring so the team can prioritize
  // response order. Best-effort patch onto the Sanity doc; a triage or patch
  // failure must never affect the user-facing submission result.
  let triage: TriageResult | null = null;
  try {
    triage = scoreInquiry({ schemaType, fields: parsed.data as Record<string, unknown> });
    const client = getSanityWriteClient();
    await client
      .patch(docId)
      .set({
        triageScore: triage.score,
        triageTier: triage.tier,
        lane: triage.lane,
        routeTo: triage.routeTo,
        slaHours: triage.slaHours,
      })
      .commit();
  } catch (err) {
    console.error(`[submitForm] Triage scoring/patch failed for ${schemaType} (doc ${docId}):`, err);
  }

  // 4. Notify via Resend — non-blocking, loud-fail in logs only
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO || "jeramey.james@gmail.com";
  const from = process.env.RESEND_FROM || "Konative <team@konative.com>";

  const triageHtml = triage
    ? `<div style="margin:0 0 12px;padding:10px;background:#f5f5f5;font:13px monospace">` +
      `<strong>[${triage.tier.toUpperCase()} · ${triage.lane} · SLA ${triage.slaHours}h]</strong> ` +
      `score ${triage.score} · route <strong>${triage.routeTo}</strong>` +
      `<ul style="margin:8px 0 0;padding-left:20px">${triage.reasons.map(r => `<li>${r}</li>`).join("")}</ul>` +
      `</div>`
    : "";
  const finalSubject = triage ? `[${triage.tier.toUpperCase()} · ${triage.lane}] ${emailSubject}` : emailSubject;

  if (!apiKey) {
    console.warn(
      `[submitForm] RESEND_API_KEY not set — skipping email for ${schemaType} (doc ${docId})`,
    );
  } else {
    const baseHtml =
      emailHtml ||
      `<h2>${emailSubject}</h2><pre>${JSON.stringify(parsed.data, null, 2)}</pre><p>Sanity doc: ${docId}</p>`;
    // `after()` extends the Worker's execution past the response (maps to
    // Cloudflare's ctx.waitUntil() via OpenNext) — a plain un-awaited fetch()
    // can be silently killed the instant the response is sent on Workers.
    after(() =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject: finalSubject, html: `${triageHtml}${baseHtml}` }),
      }).catch(err => console.error(`[submitForm] Resend error for ${schemaType}:`, err)),
    );
  }

  // 5. Forward to Twenty/n8n when configured. Keep the public form successful
  // when the automation layer is temporarily unavailable; Sanity remains the
  // durable intake record and the webhook can be replayed from there.
  const crmWebhookUrl =
    process.env.TWENTY_INTAKE_WEBHOOK_URL || process.env.INQUIRY_WEBHOOK_URL;
  if (!crmWebhookUrl) {
    console.warn(
      `[submitForm] CRM intake webhook not set — ${schemaType} remains in Sanity (doc ${docId})`,
    );
  } else {
    after(() =>
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
          triage,
        }),
      }).catch(err => console.error(`[submitForm] CRM webhook error for ${schemaType}:`, err)),
    );
  }

  return { ok: true, id: docId };
}
