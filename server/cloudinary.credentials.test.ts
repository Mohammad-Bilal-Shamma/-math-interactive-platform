import { describe, expect, it } from "vitest";

type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function parseCloudinaryUrl(value: string): CloudinaryCredentials {
  const url = new URL(value);
  if (url.protocol !== "cloudinary:" || !url.username || !url.password || !url.hostname) {
    throw new Error("CLOUDINARY_URL must include a cloud name, API key, and API secret");
  }
  return {
    cloudName: url.hostname,
    apiKey: decodeURIComponent(url.username),
    apiSecret: decodeURIComponent(url.password),
  };
}

describe("Cloudinary credential", () => {
  it("authenticates a read-only server-side asset-list request", async () => {
    const rawUrl = process.env.CLOUDINARY_URL;
    expect(rawUrl, "CLOUDINARY_URL must be configured for this test").toBeTruthy();
    const credentials = parseCloudinaryUrl(rawUrl!);
    const authorization = Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString("base64");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${credentials.cloudName}/resources/image?max_results=1`,
      { headers: { Authorization: `Basic ${authorization}` } },
    );

    expect(response.status, "Cloudinary credentials must be accepted").toBe(200);
    const payload = await response.json() as { resources?: unknown[] };
    expect(Array.isArray(payload.resources)).toBe(true);
  }, 20_000);
});
