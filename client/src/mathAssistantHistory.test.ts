import { describe, expect, it } from "vitest";
import { mapSavedAssistantMessages } from "./mathAssistantHistory";

describe("saved assistant history", () => {
  it("restores server-provided Cloudinary delivery URLs for student-owned image keys", () => {
    expect(mapSavedAssistantMessages([
      { role: "user", content: "حل الصورة", imageKey: "math-assistant/31/question.png", imageUrl: "https://res.cloudinary.com/demo/image/upload/math-assistant/31/question.png" },
      { role: "assistant", content: "الإجابة", imageKey: null },
    ])).toEqual([
      { role: "user", content: "حل الصورة", imageUrl: "https://res.cloudinary.com/demo/image/upload/math-assistant/31/question.png" },
      { role: "assistant", content: "الإجابة", imageUrl: undefined },
    ]);
  });
});
