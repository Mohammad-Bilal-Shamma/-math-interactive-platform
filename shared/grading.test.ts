import { describe, expect, it } from "vitest";
import { learningUnits } from "./learningContent";
import { gradeQuestion, parseNumericAnswer } from "./grading";
import type { MultiStepQuestion, NumericQuestion, TableQuestion } from "./learningTypes";

const numericQuestion = learningUnits[0]!.questions.find((question): question is NumericQuestion => question.type === "numeric")!;
const tableQuestion = learningUnits[1]!.questions.find((question): question is TableQuestion => question.type === "table")!;
const multiStepQuestion = learningUnits[2]!.questions.find((question): question is MultiStepQuestion => question.type === "multiStep")!;

describe("numerical answer parsing", () => {
  it("accepts Arabic digits and Arabic decimal separators", () => {
    expect(parseNumericAnswer("٢٥٫٧٤")).toBe(25.74);
  });

  it("rejects non-numeric expressions in numeric-only questions", () => {
    expect(parseNumericAnswer("خمسة وعشرون")).toBeNull();
  });
});

describe("tolerance-aware question grading", () => {
  it("accepts answers within the defined tolerance", () => {
    const result = gradeQuestion(numericQuestion, "25.74005");
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(1);
  });

  it("returns the correct step when a numeric answer is wrong", () => {
    const result = gradeQuestion(numericQuestion, "25.7");
    expect(result.isCorrect).toBe(false);
    expect(result.correctStep).toContain("25.74");
  });

  it("grades table cells independently for immediate feedback", () => {
    const result = gradeQuestion(tableQuestion, { h: "0.1", delta0: "0.48", delta1: "0.42" });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBeCloseTo(2 / 3);
    expect(result.stepFeedback?.find(step => step.id === "delta1")?.correctStep).toContain("0.49");
  });

  it("keeps multi-step feedback attached to the incorrect step", () => {
    const result = gradeQuestion(multiStepQuestion, { alpha: "0.5", beta: "-1.25", x1: "0.5", y1: "-1.2" });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBeCloseTo(3 / 4);
    expect(result.stepFeedback?.filter(step => !step.isCorrect).map(step => step.id)).toEqual(["y1"]);
  });
});

describe("initial curriculum catalog", () => {
  it("contains all five source-derived numerical-methods units", () => {
    expect(learningUnits).toHaveLength(5);
    expect(learningUnits.every(unit => unit.lessons.length >= 2 && unit.questions.length >= 1)).toBe(true);
  });
});
