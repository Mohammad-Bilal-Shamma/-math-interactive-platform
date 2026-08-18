import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => children,
}));

import { AIChatBox } from "./AIChatBox";

describe("AIChatBox image attachments", () => {
  it("renders an uploaded question preview, file picker, and accessible removal control", () => {
    const markup = renderToStaticMarkup(
      <AIChatBox
        messages={[{ role: "user", content: "حل المسألة", imageUrl: "/manus-storage/math-assistant/31/question.png" }]}
        onSendMessage={() => undefined}
        onSelectAttachment={() => undefined}
        onRemoveAttachment={() => undefined}
        attachment={{ url: "/manus-storage/math-assistant/31/question.png", fileName: "question.png" }}
      />,
    );

    expect(markup).toContain("صورة مرفقة: question.png");
    expect(markup).toContain("إزالة الصورة المرفقة");
    expect(markup).toContain("إرفاق صورة لمسألة");
    expect(markup).toContain("صورة المسألة المرفقة");
  });
});
