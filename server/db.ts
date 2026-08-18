import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  questionAttempts,
  studentLessonProgress,
  studentUnitProgress,
  users,
} from "../drizzle/schema";
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
    } else if (user.openId === ENV.ownerOpenId) {
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

export async function getStudentLearningProgress(userId: number) {
  const db = await getDb();
  if (!db) return { units: [], lessons: [], recentAttempts: [] };

  const [units, lessons, recentAttempts] = await Promise.all([
    db.select().from(studentUnitProgress).where(eq(studentUnitProgress.userId, userId)),
    db.select().from(studentLessonProgress).where(eq(studentLessonProgress.userId, userId)),
    db
      .select()
      .from(questionAttempts)
      .where(eq(questionAttempts.userId, userId))
      .orderBy(sql`${questionAttempts.createdAt} desc`)
      .limit(12),
  ]);

  return { units, lessons, recentAttempts };
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
}
