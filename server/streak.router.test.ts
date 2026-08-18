import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mockedDb = vi.hoisted(() => ({
  getStudentDailyStreak: vi.fn(),
  recordLessonProgress: vi.fn(),
  recordQuestionAttempt: vi.fn(),
}));

vi.mock("./db", () => mockedDb);

import { appRouter } from "./routers";

function createStudentContext(): TrpcContext {
  return {
    user: {
      id: 17,
      openId: "user_streak",
      email: "streak@example.com",
      name: "Streak Student",
      loginMethod: "clerk",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("learning daily streak router", () => {
  it("returns the authenticated student’s saved streak", async () => {
    mockedDb.getStudentDailyStreak.mockResolvedValue({ currentStreak: 4, longestStreak: 9, lastActiveDate: "2026-08-18" });
    const caller = appRouter.createCaller(createStudentContext());

    await expect(caller.learning.streak()).resolves.toEqual({ currentStreak: 4, longestStreak: 9, lastActiveDate: "2026-08-18" });
    expect(mockedDb.getStudentDailyStreak).toHaveBeenCalledWith(17);
  });

  it("routes lesson activity through the persistence function that updates the daily streak", async () => {
    mockedDb.recordLessonProgress.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createStudentContext());

    await caller.learning.recordLessonProgress({ unitId: "unit-errors", lessonId: "rounding-rules", isCompleted: false });

    expect(mockedDb.recordLessonProgress).toHaveBeenCalledWith({ userId: 17, unitId: "unit-errors", lessonId: "rounding-rules", isCompleted: false });
  });
});
