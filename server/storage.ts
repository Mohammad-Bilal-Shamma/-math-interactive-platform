import { createHash, randomUUID } from "node:crypto";
import { ENV } from "./_core/env";

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function parseCloudinaryUrl(value: string): CloudinaryConfig {
  const url = new URL(value);
  if (url.protocol !== "cloudinary:" || !url.username || !url.password || !url.hostname) {
    throw new Error("CLOUDINARY_URL must include a cloud name, API key, and API secret.");
  }

  return {
    cloudName: url.hostname,
    apiKey: decodeURIComponent(url.username),
    apiSecret: decodeURIComponent(url.password),
  };
}

function getCloudinaryConfig(): CloudinaryConfig {
  if (!ENV.cloudinaryUrl.trim()) {
    throw new Error("لم يتم إعداد تخزين الصور على الخادم. أضف CLOUDINARY_URL لإتاحة رفع الصور.");
  }
  return parseCloudinaryUrl(ENV.cloudinaryUrl);
}

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/^\/+/, "");
  if (!key || key.includes("..")) throw new Error("مفتاح تخزين الصورة غير صالح.");
  return key;
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export function buildCloudinaryDeliveryUrl(key: string, cloudName: string): string {
  const normalizedKey = normalizeKey(key).split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/f_auto,q_auto/${normalizedKey}`;
}

function createUploadSignature({ publicId, timestamp, apiSecret }: { publicId: string; timestamp: number; apiSecret: string }) {
  return createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
}

function toDataUrl(data: Buffer | Uint8Array | string, contentType: string): string {
  if (typeof data === "string" && data.startsWith("data:")) return data;
  return `data:${contentType};base64,${Buffer.from(data).toString("base64")}`;
}

/** Upload a server-validated image through Cloudinary's signed Upload API. */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const config = getCloudinaryConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const timestamp = Math.floor(Date.now() / 1000);
  const form = new FormData();
  form.set("file", toDataUrl(data, contentType));
  form.set("public_id", key);
  form.set("api_key", config.apiKey);
  form.set("timestamp", String(timestamp));
  form.set("signature", createUploadSignature({ publicId: key, timestamp, apiSecret: config.apiSecret }));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`تعذر رفع الصورة إلى التخزين الخارجي (${response.status}): ${message}`);
  }

  const result = await response.json() as { secure_url?: string };
  return { key, url: result.secure_url || buildCloudinaryDeliveryUrl(key, config.cloudName) };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const config = getCloudinaryConfig();
  const key = normalizeKey(relKey);
  return { key, url: buildCloudinaryDeliveryUrl(key, config.cloudName) };
}

/** Cloudinary delivery URLs are used by the client and vision-capable assistant. */
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  return (await storageGet(relKey)).url;
}
