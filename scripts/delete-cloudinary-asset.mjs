import { createHash } from "node:crypto";

const publicId = process.argv[2];
const connection = process.env.CLOUDINARY_URL;

if (!publicId || !connection) {
  console.error("Usage: CLOUDINARY_URL=... node scripts/delete-cloudinary-asset.mjs <public-id>");
  process.exit(1);
}

const config = new URL(connection);
const timestamp = Math.floor(Date.now() / 1000);
const signature = createHash("sha1")
  .update(`public_id=${publicId}&timestamp=${timestamp}${decodeURIComponent(config.password)}`)
  .digest("hex");
const form = new FormData();
form.set("public_id", publicId);
form.set("timestamp", String(timestamp));
form.set("api_key", decodeURIComponent(config.username));
form.set("signature", signature);

const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.hostname)}/image/destroy`, {
  method: "POST",
  body: form,
});
const body = await response.json().catch(() => ({}));

if (!response.ok || body.result !== "ok") {
  console.error("Cloudinary asset cleanup failed.");
  process.exit(1);
}

console.log("Cloudinary test asset removed.");
