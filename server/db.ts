import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import {
  InsertUser,
  learningLessons,
  learningQuestions,
  questionAttempts,
  studentDailyStreaks,
  studentLessonProgress,
  studentUnitProgress,
  users,
} from "../drizzle/schema";
import { advanceDailyStreak, utcDayKey } from "../shared/dailyStreak";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId || user.openId === ENV.clerkAdminUserId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentDailyStreak(userId: number) {
  const db = await getDb();
  if (!db) return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };

  const result = await db.select().from(studentDailyStreaks).where(eq(studentDailyStreaks.userId, userId)).limit(1);
  const streak = result[0];
  return streak
    ? { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActiveDate: streak.lastActiveDate }
    : { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
}

export async function recordDailyActivity(userId: number, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const current = await getStudentDailyStreak(userId);
  const next = advanceDailyStreak(current, utcDayKey(now));
  if (next === current) return next;

  await db.insert(studentDailyStreaks).values({
    userId,
    currentStreak: next.currentStreak,
    longestStreak: next.longestStreak,
    lastActiveDate: next.lastActiveDate,
  }).onDuplicateKeyUpdate({
    set: {
      currentStreak: next.currentStreak,
      longestStreak: next.longestStreak,
      lastActiveDate: next.lastActiveDate,
      updatedAt: new Date(),
    },
  });

  return next;
}

export async function getStudentLearningProgress(userId: number) {
  const db = await getDb();
  if (!db) return { units: [], lessons: [], recentAttempts: [], streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null } };

  const [units, lessons, recentAttempts, streak] = await Promise.all([
    db.select().from(studentUnitProgress).where(eq(studentUnitProgress.userId, userId)),
    db.select().from(studentLessonProgress).where(eq(studentLessonProgress.userId, userId)),
    db
      .select()
      .from(questionAttempts)
      .where(eq(questionAttempts.userId, userId))
      .orderBy(sql`${questionAttempts.createdAt} desc`)
      .limit(12),
    getStudentDailyStreak(userId),
  ]);

  return { units, lessons, recentAttempts, streak };
}

export async function recordLessonProgress(input: {
  userId: number;
  unitId: string;
  lessonId: string;
  isCompleted: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const existing = await db
    .select()
    .from(studentLessonProgress)
    .where(and(eq(studentLessonProgress.userId, input.userId), eq(studentLessonProgress.lessonId, input.lessonId)))
    .limit(1);
  const shouldIncreaseCompleted = input.isCompleted && existing[0]?.isCompleted !== 1;

  await db
    .insert(studentLessonProgress)
    .values({
      userId: input.userId,
      unitId: input.unitId,
      lessonId: input.lessonId,
      isCompleted: input.isCompleted ? 1 : 0,
      lastViewedAt: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: {
        isCompleted: input.isCompleted ? 1 : existing[0]?.isCompleted ?? 0,
        lastViewedAt: new Date(),
      },
    });

  await db
    .insert(studentUnitProgress)
    .values({
      userId: input.userId,
      unitId: input.unitId,
      completedLessons: shouldIncreaseCompleted ? 1 : 0,
      lastLessonId: input.lessonId,
    })
    .onDuplicateKeyUpdate({
      set: {
        completedLessons: shouldIncreaseCompleted
          ? sql`${studentUnitProgress.completedLessons} + 1`
          : sql`${studentUnitProgress.completedLessons}`,
        lastLessonId: input.lessonId,
        updatedAt: new Date(),
      },
    });

  await recordDailyActivity(input.userId);
}

export async function recordQuestionAttempt(input: {
  userId: number;
  unitId: string;
  lessonId: string;
  questionId: string;
  isCorrect: boolean;
  scorePercent: number;
  answerJson?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  await db.insert(questionAttempts).values({
    userId: input.userId,
    unitId: input.unitId,
    lessonId: input.lessonId,
    questionId: input.questionId,
    isCorrect: input.isCorrect ? 1 : 0,
    scorePercent: input.scorePercent,
    answerJson: input.answerJson,
  });

  await db
    .insert(studentUnitProgress)
    .values({
      userId: input.userId,
      unitId: input.unitId,
      correctAnswers: input.isCorrect ? 1 : 0,
      attempts: 1,
      lastLessonId: input.lessonId,
    })
    .onDuplicateKeyUpdate({
      set: {
        correctAnswers: input.isCorrect
          ? sql`${studentUnitProgress.correctAnswers} + 1`
          : sql`${studentUnitProgress.correctAnswers}`,
        attempts: sql`${studentUnitProgress.attempts} + 1`,
        lastLessonId: input.lessonId,
        updatedAt: new Date(),
      },
    });

  await recordDailyActivity(input.userId);
}

export type TeacherQuestionInput = {
  id?: string;
  unitId: string;
  lessonId: string;
  questionType: "numeric" | "choice" | "table" | "multiStep";
  title: string;
  prompt: string;
  answerSchemaJson: string;
  tolerance?: string;
  explanation?: string;
  correctStep?: string;
  isPublished: boolean;
  sortOrder: number;
  createdByUserId: number;
};

export async function getTeacherDashboard() {
  const db = await getDb();
  if (!db) return { lessons: [], questions: [], students: [], recentAttempts: [] };

  const [lessons, questions, students, recentAttempts] = await Promise.all([
    db.select().from(learningLessons).orderBy(learningLessons.unitId, learningLessons.sortOrder),
    db.select().from(learningQuestions).orderBy(learningQuestions.unitId, learningQuestions.sortOrder),
    db.select().from(users).orderBy(desc(users.lastSignedIn)).limit(40),
    db.select().from(questionAttempts).orderBy(desc(questionAttempts.createdAt)).limit(20),
  ]);

  return { lessons, questions, students, recentAttempts };
}

export async function saveTeacherQuestion(input: TeacherQuestionInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const id = input.id ?? `teacher-question-${nanoid(10)}`;
  const values = {
    id,
    unitId: input.unitId,
    lessonId: input.lessonId,
    questionType: input.questionType,
    title: input.title,
    prompt: input.prompt,
    answerSchemaJson: input.answerSchemaJson,
    tolerance: input.tolerance ?? null,
    explanation: input.explanation ?? null,
    correctStep: input.correctStep ?? null,
    isPublished: input.isPublished ? 1 : 0,
    sortOrder: input.sortOrder,
    createdByUserId: input.createdByUserId,
  };

  await db.insert(learningQuestions).values(values).onDuplicateKeyUpdate({
    set: {
      unitId: values.unitId,
      lessonId: values.lessonId,
      questionType: values.questionType,
      title: values.title,
      prompt: values.prompt,
      answerSchemaJson: values.answerSchemaJson,
      tolerance: values.tolerance,
      explanation: values.explanation,
      correctStep: values.correctStep,
      isPublished: values.isPublished,
      sortOrder: values.sortOrder,
      updatedAt: new Date(),
    },
  });

  return id;
}

export type TeacherLessonInput = {
  id?: string;
  unitId: string;
  title: string;
  summary?: string;
  contentJson?: string;
  visualizationType?: "interpolation" | "integration" | "newton" | "euler" | "";
  visualizationConfigJson?: string;
  isPublished: boolean;
  sortOrder: number;
};

export async function saveTeacherLesson(input: TeacherLessonInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const id = input.id ?? `teacher-lesson-${nanoid(10)}`;
  const values = {
    id,
    unitId: input.unitId,
    title: input.title,
    summary: input.summary ?? null,
    contentJson: input.contentJson ?? null,
    visualizationType: input.visualizationType || null,
    visualizationConfigJson: input.visualizationConfigJson ?? null,
    isPublished: input.isPublished ? 1 : 0,
    sortOrder: input.sortOrder,
  };

  await db.insert(learningLessons).values(values).onDuplicateKeyUpdate({
    set: {
      unitId: values.unitId,
      title: values.title,
      summary: values.summary,
      contentJson: values.contentJson,
      visualizationType: values.visualizationType,
      visualizationConfigJson: values.visualizationConfigJson,
      isPublished: values.isPublished,
      sortOrder: values.sortOrder,
      updatedAt: new Date(),
    },
  });

  return id;
}
