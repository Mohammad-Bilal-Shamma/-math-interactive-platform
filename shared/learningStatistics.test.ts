import { describe, expect, it } from "vitest";
import { learningUnits } from "./learningContent";
import { summarizeLearningProgress } from "./learningStatistics";

describe("learning progress summary", () => {
  it("aggregates completed lessons, attempts, correct answers, and catalog totals", () => {
    const summary = summarizeLearningProgress(
      learningUnits,
      [
        { unitId: "unit-errors", attempts: 4, correctAnswers: 3 },
        { unitId: "unit-interpolation", attempts: 2, correctAnswers: 1 },
      ],
      [
        { lessonId: "rounding-rules", isCompleted: 1 },
        { lessonId: "error-bounds", isCompleted: 1 },
        { lessonId: "polynomial-interpolation", isCompleted: 0 },
      ],
    );

    expect(summary).toMatchObject({
      totalUnits: 5,
      totalLessons: 10,
      totalQuestions: 6,
      completedLessons: 2,
      answeredQuestions: 6,
      correctAnswers: 4,
    });
  });
});
