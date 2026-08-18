import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LessonRecap } from "./LessonRecap";

describe("LessonRecap", () => {
  it("renders the key idea, formula label, and mastery takeaway in Arabic", () => {
    const markup = renderToStaticMarkup(<LessonRecap recap={{ keyIdea: "الفكرة الأساسية للاختبار.", coreFormula: "E=|x-x_0|", masteryTakeaway: "إتقان قراءة القانون وتطبيقه." }} />);

    expect(markup).toContain("ملخص الدرس");
    expect(markup).toContain("الفكرة الأساسية للاختبار.");
    expect(markup).toContain("القانون أو الإجراء الأهم");
    expect(markup).toContain("إتقان قراءة القانون وتطبيقه.");
  });
});
