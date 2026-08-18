import { describe, expect, it } from "vitest";
import { learningUnits } from "./learningContent";

describe("lesson recap content", () => {
  it("provides a complete structured recap for every source-derived lesson", () => {
    const lessons = learningUnits.flatMap(unit => unit.lessons);

    expect(lessons).toHaveLength(10);
    expect(lessons.every(lesson => lesson.recap.keyIdea.length > 0 && lesson.recap.coreFormula.length > 0 && lesson.recap.masteryTakeaway.length > 0)).toBe(true);
  });
});
