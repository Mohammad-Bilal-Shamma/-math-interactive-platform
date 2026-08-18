import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const learningUnits = mysqlTable("learning_units", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const learningLessons = mysqlTable("learning_lessons", {
  id: varchar("id", { length: 96 }).primaryKey(),
  unitId: varchar("unitId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  contentJson: text("contentJson"),
  visualizationType: varchar("visualizationType", { length: 48 }),
  visualizationConfigJson: text("visualizationConfigJson"),
  isPublished: int("isPublished").notNull().default(1),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const learningQuestions = mysqlTable("learning_questions", {
  id: varchar("id", { length: 96 }).primaryKey(),
  unitId: varchar("unitId", { length: 64 }).notNull(),
  lessonId: varchar("lessonId", { length: 96 }).notNull(),
  questionType: varchar("questionType", { length: 32 }).notNull(),
  title: varchar("title", { length: 255 }),
  prompt: text("prompt"),
  answerSchemaJson: text("answerSchemaJson"),
  tolerance: varchar("tolerance", { length: 32 }),
  explanation: text("explanation"),
  correctStep: text("correctStep"),
  isPublished: int("isPublished").notNull().default(1),
  createdByUserId: int("createdByUserId"),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const learningSolvedExamples = mysqlTable("learning_solved_examples", {
  id: varchar("id", { length: 96 }).primaryKey(),
  unitId: varchar("unitId", { length: 64 }).notNull(),
  lessonId: varchar("lessonId", { length: 96 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studentLessonProgress = mysqlTable(
  "student_lesson_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    unitId: varchar("unitId", { length: 64 }).notNull(),
    lessonId: varchar("lessonId", { length: 96 }).notNull(),
    isCompleted: int("isCompleted").notNull().default(0),
    lastViewedAt: timestamp("lastViewedAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("student_lesson_unique").on(table.userId, table.lessonId)],
);

export const studentUnitProgress = mysqlTable(
  "student_unit_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    unitId: varchar("unitId", { length: 64 }).notNull(),
    completedLessons: int("completedLessons").notNull().default(0),
    correctAnswers: int("correctAnswers").notNull().default(0),
    attempts: int("attempts").notNull().default(0),
    lastLessonId: varchar("lastLessonId", { length: 96 }),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("student_unit_unique").on(table.userId, table.unitId)],
);

export const questionAttempts = mysqlTable("question_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  unitId: varchar("unitId", { length: 64 }).notNull(),
  lessonId: varchar("lessonId", { length: 96 }).notNull(),
  questionId: varchar("questionId", { length: 96 }).notNull(),
  isCorrect: int("isCorrect").notNull(),
  scorePercent: int("scorePercent").notNull(),
  answerJson: text("answerJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studentDailyStreaks = mysqlTable(
  "student_daily_streaks",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    currentStreak: int("currentStreak").notNull().default(0),
    longestStreak: int("longestStreak").notNull().default(0),
    lastActiveDate: varchar("lastActiveDate", { length: 10 }),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("student_daily_streak_user_unique").on(table.userId)],
);

export const studentAssistantMessages = mysqlTable(
  "student_assistant_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    content: text("content").notNull(),
    imageKey: varchar("imageKey", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("student_assistant_messages_user_created_idx").on(table.userId, table.createdAt)],
);
