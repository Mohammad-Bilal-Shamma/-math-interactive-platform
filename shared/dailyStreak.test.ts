import { describe, expect, it } from "vitest";
import { advanceDailyStreak, utcDayKey } from "./dailyStreak";

describe("daily streak rules", () => {
  it("keeps the streak unchanged for repeated activity on the same UTC day", () => {
    const state = { currentStreak: 3, longestStreak: 4, lastActiveDate: "2026-08-18" };
    expect(advanceDailyStreak(state, "2026-08-18")).toEqual(state);
  });

  it("extends a streak only after activity on the immediately following day", () => {
    expect(advanceDailyStreak({ currentStreak: 3, longestStreak: 3, lastActiveDate: "2026-08-17" }, "2026-08-18")).toEqual({ currentStreak: 4, longestStreak: 4, lastActiveDate: "2026-08-18" });
  });

  it("restarts the current streak after a missed day while retaining the personal best", () => {
    expect(advanceDailyStreak({ currentStreak: 8, longestStreak: 8, lastActiveDate: "2026-08-15" }, "2026-08-18")).toEqual({ currentStreak: 1, longestStreak: 8, lastActiveDate: "2026-08-18" });
  });

  it("uses stable UTC date keys", () => {
    expect(utcDayKey(new Date("2026-08-18T23:59:59.000Z"))).toBe("2026-08-18");
  });
});
