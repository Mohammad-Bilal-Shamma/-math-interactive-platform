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
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("طي الملخص");
  });

  it("exposes an accessible collapsed state that preserves the key-idea preview", () => {
    const markup = renderToStaticMarkup(<LessonRecap initiallyExpanded={false} recap={{ keyIdea: "معاينة الفكرة الأساسية.", coreFormula: "h=x_{i+1}-x_i", masteryTakeaway: "إتقان الإجراء." }} />);

    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("توسيع الملخص");
    expect(markup).toContain("معاينة الفكرة الأساسية.");
    expect(markup).toContain("hidden=\"\"");
  });
});
