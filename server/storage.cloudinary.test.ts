import { describe, expect, it } from "vitest";
import { buildCloudinaryDeliveryUrl, parseCloudinaryUrl } from "./storage";

describe("Cloudinary storage adapter", () => {
  it("parses a complete server-only Cloudinary URL without exposing it to the client", () => {
    expect(parseCloudinaryUrl("cloudinary://api-key:api-secret@nuqta-cloud")).toEqual({
      cloudName: "nuqta-cloud",
      apiKey: "api-key",
      apiSecret: "api-secret",
    });
  });

  it("builds an HTTPS image delivery URL for an application-owned attachment key", () => {
    expect(buildCloudinaryDeliveryUrl("math-assistant/31/question image.png", "nuqta-cloud"))
      .toBe("https://res.cloudinary.com/nuqta-cloud/image/upload/f_auto,q_auto/math-assistant/31/question%20image.png");
  });

  it("rejects traversal attempts in application storage keys", () => {
    expect(() => buildCloudinaryDeliveryUrl("math-assistant/31/../other.png", "nuqta-cloud"))
      .toThrow("مفتاح تخزين الصورة غير صالح");
  });
});
