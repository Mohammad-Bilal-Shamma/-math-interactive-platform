import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const vercelConfigPath = fileURLToPath(new URL("../vercel.json", import.meta.url));

describe("Vercel SPA routing", () => {
  it("keeps serverless API paths outside the client-side fallback rewrite", async () => {
    const config = JSON.parse(await readFile(vercelConfigPath, "utf8"));

    expect(config.rewrites).toEqual([
      {
        source: "/:path((?!api/).*)",
        destination: "/index.html",
      },
    ]);
  });
});
