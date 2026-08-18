import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const vercelConfigPath = fileURLToPath(new URL("../vercel.json", import.meta.url));

describe("Vercel SPA routing", () => {
  it("keeps serverless API paths outside the client-side fallback rewrite", async () => {
    const config = JSON.parse(await readFile(vercelConfigPath, "utf8"));

    expect(config.functions["api/[...path].ts"]).toMatchObject({
      maxDuration: 30,
      includeFiles: "dist/vercel-api.js",
    });
    expect(config.rewrites).toEqual([
      {
        source: "/api/:path*",
        destination: "/api/[...path]?path=:path*",
      },
      {
        source: "/:path((?!api/).*)",
        destination: "/index.html",
      },
    ]);
  });
});
