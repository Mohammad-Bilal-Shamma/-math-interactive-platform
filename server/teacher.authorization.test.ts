import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createStudentContext(): TrpcContext {
  return {
    user: {
      id: 91,
      openId: "user_student",
      email: "student@example.com",
      name: "Student",
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

describe("teacher authorization", () => {
  it("rejects teacher dashboard access for a student account before querying data", async () => {
    const caller = appRouter.createCaller(createStudentContext());

    await expect(caller.teacher.dashboard()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("rejects teacher authoring mutations for a student account", async () => {
    const caller = appRouter.createCaller(createStudentContext());

    await expect(caller.teacher.saveQuestion({
      unitId: "unit-errors",
      lessonId: "rounding-rules",
      questionType: "numeric",
      title: "سؤال تجريبي",
      prompt: "احسب القيمة.",
      answerSchemaJson: '{"expectedValue":1}',
      tolerance: "0.001",
      isPublished: true,
      sortOrder: 1,
    })).rejects.toMatchObject<Partial<TRPCError>>({ code: "FORBIDDEN" });
  });
});
