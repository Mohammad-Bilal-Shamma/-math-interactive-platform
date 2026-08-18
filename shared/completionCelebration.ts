export function shouldCelebrateUnitCompletion(input: {
  lessonIds: string[];
  completedLessonIds: string[];
  currentLessonId: string;
  persistenceSucceeded: boolean;
}) {
  if (!input.persistenceSucceeded) return false;
  if (input.completedLessonIds.includes(input.currentLessonId)) return false;
  const completed = new Set([...input.completedLessonIds, input.currentLessonId]);
  return input.lessonIds.length > 0 && input.lessonIds.every(lessonId => completed.has(lessonId));
}
