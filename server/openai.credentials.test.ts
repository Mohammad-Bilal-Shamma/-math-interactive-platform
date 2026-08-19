import { describe, expect, it } from "vitest";

describe("external AI provider credential", () => {
  it("authenticates a lightweight server-side models request", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey, "OPENAI_API_KEY must be configured for this test").toBeTruthy();

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.status, "external AI credential must be accepted").toBe(200);
    const payload = await response.json() as { object?: string; data?: unknown[] };
    expect(payload.object).toBe("list");
    expect(Array.isArray(payload.data)).toBe(true);
  }, 20_000);
});
