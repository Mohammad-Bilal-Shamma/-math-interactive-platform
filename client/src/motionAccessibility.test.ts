import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("motion accessibility", () => {
  it("disables non-essential feedback and chart motion when reduced motion is requested", async () => {
    const css = await readFile(new URL("./index.css", import.meta.url), "utf8");

    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/\.feedback--enter[\s\S]*?animation:\s*none/);
    expect(css).toMatch(/\.visualizer__canvas[\s\S]*?animation:\s*none/);
    expect(css).toMatch(/\.question-panel[\s\S]*?transition:\s*none/);
    expect(css).toMatch(/\.celebration-confetti\s*\{\s*display:\s*none/);
  });
});
