import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock Sanity write client
vi.mock("@/sanity/writeClient", () => ({
  getSanityWriteClient: () => ({
    create: vi.fn().mockResolvedValue({ _id: "mock-id-123" }),
    patch: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      commit: vi.fn().mockResolvedValue({ _id: "mock-id-123" }),
    }),
  }),
}));

// Mock fetch for Cloudflare Email / CRM webhook calls
const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
vi.stubGlobal("fetch", mockFetch);

// Mock next/server's after() — outside a real request scope (as in tests),
// it throws; run the callback immediately instead so behavior stays testable.
vi.mock("next/server", () => ({
  after: (cb: () => unknown) => cb(),
}));

const { submitForm } = await import("@/lib/forms/submit");

const testSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

describe("submitForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDFLARE_ACCOUNT_ID = "test-account-id";
    process.env.CLOUDFLARE_EMAIL_API_TOKEN = "test-key";
    process.env.RESEND_FROM = "test@example.com";
    process.env.RESEND_TO = "owner@example.com";
  });

  it("returns ok:true with an id when valid data is submitted", async () => {
    const result = await submitForm({
      schemaType: "contactInquiry",
      zodSchema: testSchema,
      payload: { name: "Jane Doe", email: "jane@example.com" },
      emailSubject: "Test Contact",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.id).toBe("mock-id-123");
    }
  });

  it("returns ok:false with errors when validation fails", async () => {
    const result = await submitForm({
      schemaType: "contactInquiry",
      zodSchema: testSchema,
      payload: { name: "", email: "not-an-email" },
      emailSubject: "Test Contact",
    });
    expect(result.ok).toBe(false);
    if (!result.ok && result.errors) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("still returns ok:true if CLOUDFLARE_EMAIL_API_TOKEN is missing (no crash)", async () => {
    delete process.env.CLOUDFLARE_EMAIL_API_TOKEN;
    const result = await submitForm({
      schemaType: "contactInquiry",
      zodSchema: testSchema,
      payload: { name: "Jane Doe", email: "jane@example.com" },
      emailSubject: "Test Contact",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.id).toBe("mock-id-123");
    }
  });
});

import { contactSchema } from "@/lib/forms/schemas/contact";

describe("contactSchema audience field", () => {
  it("preserves a known audience slug on the parsed payload", () => {
    const parsed = contactSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      organization: "Test",
      audience: "tribes",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.audience).toBe("tribes");
    }
  });

  it("treats audience as optional", () => {
    const parsed = contactSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      organization: "Test",
    });
    expect(parsed.success).toBe(true);
  });
});
