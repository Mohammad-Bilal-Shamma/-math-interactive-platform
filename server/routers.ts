import { COOKIE_NAME } from "@shared/const";
import { learningUnits as catalogUnits } from "@shared/learningContent";
import { summarizeLearningProgress } from "@shared/learningStatistics";
import * as learningDb from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
});

export type AppRouter = typeof appRouter;
