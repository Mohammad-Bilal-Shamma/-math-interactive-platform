import { describe, expect, it } from "vitest";

const hasClerkCredentials = Boolean(
  process.env.VITE_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_ADMIN_USER_ID,
);

describe.skipIf(!hasClerkCredentials)("Clerk credentials", () => {
  it("accepts the configured secret key against the Clerk instance endpoint", async () => {
    const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;
    const serverPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    const adminUserId = process.env.CLERK_ADMIN_USER_ID;

    expect(publishableKey).toMatch(/^pk_(test|live)_/);
    expect(serverPublishableKey).toBe(publishableKey);
    expect(secretKey).toMatch(/^sk_(test|live)_/);
    expect(adminUserId).toMatch(/^user_/);

    const response = await fetch("https://api.clerk.com/v1/instance", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    expect(response.status).toBe(200);

    const teacherResponse = await fetch(`https://api.clerk.com/v1/users/${adminUserId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    expect(teacherResponse.status).toBe(200);
  }, 15_000);
});
