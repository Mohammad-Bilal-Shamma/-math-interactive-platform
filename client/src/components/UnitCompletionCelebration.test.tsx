import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UnitCompletionCelebration } from "./UnitCompletionCelebration";

describe("UnitCompletionCelebration", () => {
  it("renders an accessible success dialog with completion and continuation actions", () => {
    Object.defineProperty(globalThis, "location", { value: new URL("http://localhost/"), configurable: true });
    const markup = renderToStaticMarkup(<UnitCompletionCelebration unitTitle="التكامل العددي" unitHref="/units/numerical-integration" onDismiss={() => undefined} />);

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("أكملت وحدة");
    expect(markup).toContain("التكامل العددي");
    expect(markup).toContain("عرض إنجاز الوحدة");
    expect(markup).toContain("متابعة التعلم");
  });
});
