import { describe, expect, it } from "vitest";
import { mapSavedAssistantMessages } from "./mathAssistantHistory";

describe("saved assistant history", () => {
  it("restores text messages and maps a student-owned image key to a display URL", () => {
    expect(mapSavedAssistantMessages([
      { role: "user", content: "حل الصورة", imageKey: "math-assistant/31/question.png" },
      { role: "assistant", content: "الإجابة", imageKey: null },
    ])).toEqual([
      { role: "user", content: "حل الصورة", imageUrl: "/manus-storage/math-assistant/31/question.png" },
      { role: "assistant", content: "الإجابة", imageUrl: undefined },
    ]);
  });
});
