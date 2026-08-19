import { createHash, randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { parseCloudinaryUrl, storageGet, storagePut } from "./storage";

const runIntegration = process.env.RUN_CLOUDINARY_INTEGRATION === "1";
const describeCloudinaryIntegration = runIntegration ? describe : describe.skip;
const uploadedKeys: string[] = [];

function signature(parameters: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

describeCloudinaryIntegration("Cloudinary storage integration", () => {
  const config = parseCloudinaryUrl(process.env.CLOUDINARY_URL || "");

  afterAll(async () => {
    await Promise.all(uploadedKeys.map(async publicId => {
      const timestamp = Math.floor(Date.now() / 1000);
      const form = new FormData();
      form.set("public_id", publicId);
      form.set("timestamp", String(timestamp));
      form.set("api_key", config.apiKey);
      form.set("signature", signature({ public_id: publicId, timestamp }, config.apiSecret));
      await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`, {
        method: "POST",
        body: form,
      });
    }));
  });

  it("uploads and returns a secure HTTPS delivery URL, then removes the transient asset", async () => {
    const key = `math-assistant/healthcheck/${randomUUID()}.png`;
    const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL2WAAAAABJRU5ErkJggg==", "base64");
    const uploaded = await storagePut(key, pixel, "image/png");
    uploadedKeys.push(uploaded.key);
    const restored = await storageGet(uploaded.key);
    const restoredResponse = await fetch(restored.url);

    expect(uploaded.key).toMatch(/^math-assistant\/healthcheck\//);
    expect(uploaded.url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(restoredResponse.ok).toBe(true);
    expect(restoredResponse.headers.get("content-type")).toMatch(/^image\//);
  }, 30_000);
});
