import { describe, expect, it } from "vitest";
import { shouldCelebrateUnitCompletion } from "./completionCelebration";

describe("unit completion celebration", () => {
  it("celebrates only when the final outstanding lesson becomes complete", () => {
    expect(shouldCelebrateUnitCompletion({ lessonIds: ["a", "b"], completedLessonIds: ["a"], currentLessonId: "b", persistenceSucceeded: true })).toBe(true);
    expect(shouldCelebrateUnitCompletion({ lessonIds: ["a", "b"], completedLessonIds: ["a"], currentLessonId: "b", persistenceSucceeded: false })).toBe(false);
    expect(shouldCelebrateUnitCompletion({ lessonIds: ["a", "b"], completedLessonIds: [], currentLessonId: "a", persistenceSucceeded: true })).toBe(false);
    expect(shouldCelebrateUnitCompletion({ lessonIds: ["a", "b"], completedLessonIds: ["a", "b"], currentLessonId: "b", persistenceSucceeded: true })).toBe(false);
  });
});
