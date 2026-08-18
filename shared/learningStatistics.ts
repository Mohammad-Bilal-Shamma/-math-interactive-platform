import type { LearningUnit } from "./learningTypes";

type UnitProgressSnapshot = {
  unitId: string;
  correctAnswers: number;
  attempts: number;
};

type LessonProgressSnapshot = {
  lessonId: string;
  isCompleted: number;
};

export function summarizeLearningProgress(
  catalog: LearningUnit[],
  unitProgress: UnitProgressSnapshot[],
  lessonProgress: LessonProgressSnapshot[],
) {
  const totalLessons = catalog.reduce((count, unit) => count + unit.lessons.length, 0);
  const totalQuestions = catalog.reduce((count, unit) => count + unit.questions.length, 0);
  const completedLessons = lessonProgress.filter(lesson => lesson.isCompleted === 1).length;
  const answeredQuestions = unitProgress.reduce((count, unit) => count + unit.attempts, 0);
  const correctAnswers = unitProgress.reduce((count, unit) => count + unit.correctAnswers, 0);

  return {
    totalUnits: catalog.length,
    totalLessons,
    totalQuestions,
    completedLessons,
    answeredQuestions,
    correctAnswers,
  };
}
