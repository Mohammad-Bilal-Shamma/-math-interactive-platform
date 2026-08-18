import { describe, expect, it } from "vitest";
import { buildMathAssistantMessages, isOwnedMathAssistantImage, mathAssistantSystemPrompt, normalizeAssistantAnswer } from "./mathAssistant";

describe("math assistant safeguards", () => {
  it("accepts only image keys within the authenticated student namespace", () => {
    expect(isOwnedMathAssistantImage(21, "math-assistant/21/question.png")).toBe(true);
    expect(isOwnedMathAssistantImage(21, "math-assistant/22/question.png")).toBe(false);
    expect(isOwnedMathAssistantImage(21, "math-assistant/21/../other.png")).toBe(false);
  });

  it("builds a source-aware multimodal question message and preserves recent chat context", () => {
    const messages = buildMathAssistantMessages({
      userId: 21,
      question: "حل المعادلة في الصورة",
      history: [{ role: "assistant", content: "ما المعطيات؟" }],
    }, "https://storage.example/question.png");

    expect(messages[0]?.content).toBe(mathAssistantSystemPrompt);
    expect(messages).toHaveLength(3);
    expect(messages[2]?.content).toEqual([
      { type: "text", text: "حل المعادلة في الصورة" },
      { type: "image_url", image_url: { url: "https://storage.example/question.png", detail: "high" } },
    ]);
  });

  it("normalizes text returned by the model before sending it to the student", () => {
    expect(normalizeAssistantAnswer([{ type: "text", text: "  $$x=2$$  " }])).toBe("$$x=2$$");
  });
});
