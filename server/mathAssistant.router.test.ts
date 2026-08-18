import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mockedAssistant = vi.hoisted(() => ({
  answerMathQuestion: vi.fn(),
  uploadMathQuestionImage: vi.fn(),
}));

vi.mock("./mathAssistant", () => mockedAssistant);

import { appRouter } from "./routers";

function createStudentContext(): TrpcContext {
  return {
    user: {
      id: 31,
      openId: "user_math_assistant",
      email: "math@example.com",
      name: "Math Student",
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

describe("math assistant router", () => {
  it("passes the authenticated student identity to the text-question service", async () => {
    mockedAssistant.answerMathQuestion.mockResolvedValue({ answer: "$$x=2$$", model: "gemini-3-flash-preview" });
    const caller = appRouter.createCaller(createStudentContext());

    await expect(caller.mathAssistant.ask({ question: "حل x+3=5", history: [] })).resolves.toEqual({ answer: "$$x=2$$", model: "gemini-3-flash-preview" });
    expect(mockedAssistant.answerMathQuestion).toHaveBeenCalledWith({ userId: 31, question: "حل x+3=5", history: [] });
  });

  it("passes image uploads through the authenticated student namespace", async () => {
    mockedAssistant.uploadMathQuestionImage.mockResolvedValue({ key: "math-assistant/31/question.png", url: "/manus-storage/math-assistant/31/question.png" });
    const caller = appRouter.createCaller(createStudentContext());
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

    await expect(caller.mathAssistant.uploadImage({ dataUrl, fileName: "question.png" })).resolves.toMatchObject({ key: "math-assistant/31/question.png" });
    expect(mockedAssistant.uploadMathQuestionImage).toHaveBeenCalledWith({ userId: 31, dataUrl, fileName: "question.png" });
  });
});
