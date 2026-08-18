import { COOKIE_NAME } from "@shared/const";
import { learningUnits as catalogUnits } from "@shared/learningContent";
import { summarizeLearningProgress } from "@shared/learningStatistics";
import * as learningDb from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { answerMathQuestion, uploadMathQuestionImage } from "./mathAssistant";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  learning: router({
    catalog: publicProcedure.query(() => catalogUnits),
    progress: protectedProcedure.query(({ ctx }) => learningDb.getStudentLearningProgress(ctx.user.id)),
    streak: protectedProcedure.query(({ ctx }) => learningDb.getStudentDailyStreak(ctx.user.id)),
    statistics: protectedProcedure.query(async ({ ctx }) => {
      const progress = await learningDb.getStudentLearningProgress(ctx.user.id);

      return {
        ...progress,
        totals: summarizeLearningProgress(catalogUnits, progress.units, progress.lessons),
      };
    }),
    recordLessonProgress: protectedProcedure
      .input(
        z.object({
          unitId: z.string().min(1).max(64),
          lessonId: z.string().min(1).max(96),
          isCompleted: z.boolean(),
        }),
      )
      .mutation(({ ctx, input }) => learningDb.recordLessonProgress({ userId: ctx.user.id, ...input })),
    recordQuestionAttempt: protectedProcedure
      .input(
        z.object({
          unitId: z.string().min(1).max(64),
          lessonId: z.string().min(1).max(96),
          questionId: z.string().min(1).max(96),
          isCorrect: z.boolean(),
          scorePercent: z.number().int().min(0).max(100),
          answerJson: z.string().max(5000).optional(),
        }),
      )
      .mutation(({ ctx, input }) => learningDb.recordQuestionAttempt({ userId: ctx.user.id, ...input })),
  }),
  mathAssistant: router({
    history: protectedProcedure.query(({ ctx }) => learningDb.getStudentAssistantMessages(ctx.user.id)),
    uploadImage: protectedProcedure
      .input(z.object({ dataUrl: z.string().min(32).max(6_000_000), fileName: z.string().max(120).optional() }))
      .mutation(({ ctx, input }) => uploadMathQuestionImage({ userId: ctx.user.id, ...input })),
    ask: protectedProcedure
      .input(z.object({
        question: z.string().trim().max(6000).optional(),
        imageKey: z.string().max(512).optional(),
      }).refine(input => Boolean(input.question?.trim() || input.imageKey), { message: "أدخل سؤالًا أو أرفق صورة لمسألة رياضية." }))
      .mutation(async ({ ctx, input }) => {
        const priorMessages = await learningDb.getStudentAssistantMessages(ctx.user.id, 6);
        const question = input.question?.trim() || "أرفقت صورة لمسألة رياضية. حلّلها واشرح الخطوات.";
        await learningDb.saveStudentAssistantMessage({ userId: ctx.user.id, role: "user", content: question, imageKey: input.imageKey });
        const result = await answerMathQuestion({
          userId: ctx.user.id,
          question: input.question,
          imageKey: input.imageKey,
          history: priorMessages.map(message => ({ role: message.role, content: message.content })),
        });
        await learningDb.saveStudentAssistantMessage({ userId: ctx.user.id, role: "assistant", content: result.answer });
        return result;
      }),
  }),
  teacher: router({
    dashboard: adminProcedure.query(() => learningDb.getTeacherDashboard()),
    saveQuestion: adminProcedure
      .input(
        z.object({
          id: z.string().max(96).optional(),
          unitId: z.string().min(1).max(64),
          lessonId: z.string().min(1).max(96),
          questionType: z.enum(["numeric", "choice", "table", "multiStep"]),
          title: z.string().min(3).max(255),
          prompt: z.string().min(3).max(5000),
          answerSchemaJson: z.string().min(2).max(12000),
          tolerance: z.string().max(32).optional(),
          explanation: z.string().max(5000).optional(),
          correctStep: z.string().max(5000).optional(),
          isPublished: z.boolean(),
          sortOrder: z.number().int().min(1).max(999),
        }),
      )
      .mutation(({ ctx, input }) => learningDb.saveTeacherQuestion({ ...input, createdByUserId: ctx.user.id })),
    saveLesson: adminProcedure
      .input(
        z.object({
          id: z.string().max(96).optional(),
          unitId: z.string().min(1).max(64),
          title: z.string().min(3).max(255),
          summary: z.string().max(5000).optional(),
          contentJson: z.string().max(20000).optional(),
          visualizationType: z.enum(["", "interpolation", "integration", "newton", "euler"]),
          visualizationConfigJson: z.string().max(12000).optional(),
          isPublished: z.boolean(),
          sortOrder: z.number().int().min(1).max(999),
        }),
      )
      .mutation(({ input }) => learningDb.saveTeacherLesson(input)),
  }),
});

export type AppRouter = typeof appRouter;
