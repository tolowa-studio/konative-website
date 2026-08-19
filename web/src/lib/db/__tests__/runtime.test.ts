import { afterEach, describe, expect, it, vi } from "vitest";

describe("getKonativeDataRuntime", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("selects cloudflare-workers when not on Cloud Run and DATABASE_URI is unset", async () => {
    delete process.env.K_SERVICE;
    delete process.env.DATABASE_URI;
    const { getKonativeDataRuntime } = await import("../runtime");
    expect(getKonativeDataRuntime()).toBe("cloudflare-workers");
  });

  it("selects unconfigured-node on Cloud Run without DATABASE_URI", async () => {
    process.env.K_SERVICE = "konative-website-staging";
    delete process.env.DATABASE_URI;
    const { getKonativeDataRuntime } = await import("../runtime");
    expect(getKonativeDataRuntime()).toBe("unconfigured-node");
  });

  it("selects postgres when DATABASE_URI is set", async () => {
    process.env.DATABASE_URI = "postgres://user:pass@host:5432/db";
    const { getKonativeDataRuntime } = await import("../runtime");
    expect(getKonativeDataRuntime()).toBe("postgres");
  });
});

describe("getD1 on Cloud Run without DATABASE_URI", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("throws DatabaseUnavailableError instead of returning null", async () => {
    process.env.K_SERVICE = "konative-website-staging";
    delete process.env.DATABASE_URI;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { getD1, DatabaseUnavailableError } = await import("../client");

    await expect(getD1()).rejects.toThrow(DatabaseUnavailableError);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
