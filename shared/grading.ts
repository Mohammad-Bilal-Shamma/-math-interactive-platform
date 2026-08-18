import type { GradeResult, LearningQuestion } from "./learningTypes";

const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export function parseNumericAnswer(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const normalized = value
    .trim()
    .replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit)))
    .replace(/٫/g, ".")
    .replace(/٬/g, "")
    .replace(/,/g, "");

  if (!normalized || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isWithinTolerance(value: number | null, expected: number, tolerance: number) {
  return value !== null && Math.abs(value - expected) <= tolerance;
}

const displayNumber = (value: number) => new Intl.NumberFormat("ar", { maximumFractionDigits: 8 }).format(value);

export function gradeQuestion(question: LearningQuestion, answer: unknown): GradeResult {
  if (question.type === "numeric") {
    const numericAnswer = parseNumericAnswer(answer);
    const isCorrect = isWithinTolerance(numericAnswer, question.expectedValue, question.tolerance);
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      message: isCorrect
        ? "إجابة صحيحة. النتيجة ضمن هامش التقريب المقبول."
        : numericAnswer === null
          ? "اكتب قيمة عددية صحيحة قبل التحقق."
          : `إجابتك تختلف بمقدار ${displayNumber(Math.abs(numericAnswer - question.expectedValue))} عن القيمة المطلوبة.`,
      correctStep: isCorrect ? undefined : question.correctStep,
      expectedAnswer: displayNumber(question.expectedValue),
    };
  }

  if (question.type === "choice") {
    const isCorrect = answer === question.correctOptionId;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      message: isCorrect ? "اختيار صحيح." : question.wrongHint,
      correctStep: isCorrect ? undefined : question.correctStep,
    };
  }

  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) {
    return {
      isCorrect: false,
      score: 0,
      message: "أكمل جميع الخانات أولًا ثم تحقق من الحل.",
    };
  }

  const answerRecord = answer as Record<string, unknown>;
  const steps = question.type === "table" ? question.fields : question.steps;
  const stepFeedback = steps.map(step => {
    const actual = parseNumericAnswer(answerRecord[step.id]);
    const isCorrect = isWithinTolerance(actual, step.expectedValue, step.tolerance);
    return {
      id: step.id,
      isCorrect,
      message: isCorrect
        ? "هذه الخطوة صحيحة."
        : actual === null
          ? "أدخل قيمة عددية لهذه الخطوة."
          : `القيمة الصحيحة هي ${displayNumber(step.expectedValue)} ضمن هامش التقريب المحدد.`,
      correctStep: step.correctStep,
    };
  });
  const correctCount = stepFeedback.filter(step => step.isCorrect).length;
  const isCorrect = correctCount === stepFeedback.length;

  return {
    isCorrect,
    score: stepFeedback.length ? correctCount / stepFeedback.length : 0,
    message: isCorrect
      ? "أحسنت، جميع الخطوات صحيحة."
      : `تمت إجابة ${correctCount} من ${stepFeedback.length} خطوات بصورة صحيحة. راجع الخطوات المعلّمة.`,
    stepFeedback,
  };
}
