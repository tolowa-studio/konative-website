"use client";

import { FormEvent, useState } from "react";

// Client island for the R4 Readiness Audit inquiry form.
// Posts to /api/audit/submit. See web/src/lib/forms/schemas/audit.ts for shape.

export default function AuditInquiryForm({ source }: { source?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = { source: source ?? "readiness_audit_page" };
    fd.forEach((v, k) => {
      if (typeof v === "string" && v.trim().length > 0) payload[k] = v.toString();
    });
    try {
      const res = await fetch("/api/audit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Submission failed. Please email team@konative.com.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please email team@konative.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="audit-form audit-form--done">
        <h3>Got it. We&apos;ll be in touch within one business day.</h3>
        <p>
          Scott or Terry will reply directly. If you need to reach us sooner,
          email <a href="mailto:team@konative.com">team@konative.com</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="audit-form" onSubmit={onSubmit} noValidate>
      <div className="audit-form__row">
        <label className="audit-form__field">
          <span>Name</span>
          <input name="name" required autoComplete="name" />
        </label>
        <label className="audit-form__field">
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>

      <div className="audit-form__row">
        <label className="audit-form__field">
          <span>Organization</span>
          <input name="organization" required autoComplete="organization" />
        </label>
        <label className="audit-form__field">
          <span>Role <small>(optional)</small></span>
          <input name="role" autoComplete="organization-title" />
        </label>
      </div>

      <div className="audit-form__row">
        <label className="audit-form__field">
          <span>You are a…</span>
          <select name="audience" defaultValue="">
            <option value="" disabled>Pick one</option>
            <option value="landowner">Landowner</option>
            <option value="developer">Data center developer / sponsor</option>
            <option value="investor">Capital / investor</option>
            <option value="operator">Operator / occupier</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="audit-form__field">
          <span>Timeline</span>
          <select name="timeline" defaultValue="">
            <option value="" disabled>Pick one</option>
            <option value="this_quarter">This quarter</option>
            <option value="this_year">This year</option>
            <option value="12_months_plus">12+ months</option>
            <option value="exploratory">Exploratory</option>
          </select>
        </label>
      </div>

      <div className="audit-form__row">
        <label className="audit-form__field">
          <span>State / region <small>(optional)</small></span>
          <input name="state" placeholder="e.g. WA, ERCOT, BC" />
        </label>
        <label className="audit-form__field">
          <span>Acreage <small>(if applicable)</small></span>
          <input name="acreage" placeholder="e.g. 200" inputMode="numeric" />
        </label>
      </div>

      <label className="audit-form__field audit-form__field--full">
        <span>Power / substation context <small>(optional)</small></span>
        <input name="power_context" placeholder="e.g. 230kV substation 2mi south, no interconnection filed yet" />
      </label>

      <label className="audit-form__field audit-form__field--full">
        <span>What do you want to come out of this engagement?</span>
        <textarea name="notes" rows={4} placeholder="A sentence or two on what success looks like." />
      </label>

      {error && <p className="audit-form__error">{error}</p>}

      <button type="submit" disabled={submitting} className="audit-form__submit">
        {submitting ? "Sending…" : "Request a Readiness Audit →"}
      </button>
      <p className="audit-form__sla">
        Reply within <strong>one business day</strong>. No marketing list, no resale.
      </p>
    </form>
  );
}
