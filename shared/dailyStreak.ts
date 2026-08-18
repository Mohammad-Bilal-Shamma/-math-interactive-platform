export type DailyStreakState = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
};

export function utcDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function advanceDailyStreak(state: DailyStreakState, activeDate: string): DailyStreakState {
  if (state.lastActiveDate === activeDate) return state;

  const previousDay = new Date(`${activeDate}T00:00:00.000Z`);
  previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  const wasActiveYesterday = state.lastActiveDate === utcDayKey(previousDay);
  const currentStreak = wasActiveYesterday ? state.currentStreak + 1 : 1;

  return {
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastActiveDate: activeDate,
  };
}
