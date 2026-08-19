import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mockedAssistant = vi.hoisted(() => ({
  answerMathQuestion: vi.fn(),
  uploadMathQuestionImage: vi.fn(),
}));
const mockedDb = vi.hoisted(() => ({
  getStudentAssistantMessages: vi.fn(),
  saveStudentAssistantMessage: vi.fn(),
}));
const mockedStorage = vi.hoisted(() => ({ storageGet: vi.fn() }));

vi.mock("./mathAssistant", () => mockedAssistant);
vi.mock("./db", () => mockedDb);
vi.mock("./storage", () => mockedStorage);

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
    mockedDb.getStudentAssistantMessages.mockResolvedValue([]);
    mockedDb.saveStudentAssistantMessage.mockResolvedValue(undefined);
    mockedAssistant.answerMathQuestion.mockResolvedValue({ answer: "$$x=2$$", model: "gemini-3-flash-preview" });
    const caller = appRouter.createCaller(createStudentContext());

    await expect(caller.mathAssistant.ask({ question: "حل x+3=5" })).resolves.toEqual({ answer: "$$x=2$$", model: "gemini-3-flash-preview" });
    expect(mockedAssistant.answerMathQuestion).toHaveBeenCalledWith({ userId: 31, question: "حل x+3=5", history: [] });
    expect(mockedDb.saveStudentAssistantMessage).toHaveBeenNthCalledWith(1, { userId: 31, role: "user", content: "حل x+3=5", imageKey: undefined });
    expect(mockedDb.saveStudentAssistantMessage).toHaveBeenNthCalledWith(2, { userId: 31, role: "assistant", content: "$$x=2$$" });
  });

  it("passes image uploads through the authenticated student namespace", async () => {
    mockedAssistant.uploadMathQuestionImage.mockResolvedValue({ key: "math-assistant/31/question.png", url: "/manus-storage/math-assistant/31/question.png" });
    const caller = appRouter.createCaller(createStudentContext());
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

    await expect(caller.mathAssistant.uploadImage({ dataUrl, fileName: "question.png" })).resolves.toMatchObject({ key: "math-assistant/31/question.png" });
    expect(mockedAssistant.uploadMathQuestionImage).toHaveBeenCalledWith({ userId: 31, dataUrl, fileName: "question.png" });
  });

  it("returns only the authenticated student’s saved conversation history", async () => {
    mockedDb.getStudentAssistantMessages.mockResolvedValue([{ id: 8, userId: 31, role: "assistant", content: "إجابة محفوظة", imageKey: null }]);
    const caller = appRouter.createCaller(createStudentContext());

    await expect(caller.mathAssistant.history()).resolves.toEqual([{ id: 8, userId: 31, role: "assistant", content: "إجابة محفوظة", imageKey: null }]);
    expect(mockedDb.getStudentAssistantMessages).toHaveBeenCalledWith(31);
  });

  it("adds a safe image-delivery URL only for the authenticated student's saved attachment", async () => {
    mockedDb.getStudentAssistantMessages.mockResolvedValue([{ id: 9, userId: 31, role: "user", content: "حل الصورة", imageKey: "math-assistant/31/question.png" }]);
    mockedStorage.storageGet.mockResolvedValue({ key: "math-assistant/31/question.png", url: "https://res.cloudinary.com/demo/image/upload/math-assistant/31/question.png" });
    const caller = appRouter.createCaller(createStudentContext());

    await expect(caller.mathAssistant.history()).resolves.toEqual([{ id: 9, userId: 31, role: "user", content: "حل الصورة", imageKey: "math-assistant/31/question.png", imageUrl: "https://res.cloudinary.com/demo/image/upload/math-assistant/31/question.png" }]);
    expect(mockedStorage.storageGet).toHaveBeenCalledWith("math-assistant/31/question.png");
  });
});
