CREATE TABLE `learning_lessons` (
	`id` varchar(96) NOT NULL,
	`unitId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_questions` (
	`id` varchar(96) NOT NULL,
	`unitId` varchar(64) NOT NULL,
	`lessonId` varchar(96) NOT NULL,
	`questionType` varchar(32) NOT NULL,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_units` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`unitId` varchar(64) NOT NULL,
	`lessonId` varchar(96) NOT NULL,
	`questionId` varchar(96) NOT NULL,
	`isCorrect` int NOT NULL,
	`scorePercent` int NOT NULL,
	`answerJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `question_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`unitId` varchar(64) NOT NULL,
	`lessonId` varchar(96) NOT NULL,
	`isCompleted` int NOT NULL DEFAULT 0,
	`lastViewedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_lesson_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_lesson_unique` UNIQUE(`userId`,`lessonId`)
);
--> statement-breakpoint
CREATE TABLE `student_unit_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`unitId` varchar(64) NOT NULL,
	`completedLessons` int NOT NULL DEFAULT 0,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`attempts` int NOT NULL DEFAULT 0,
	`lastLessonId` varchar(96),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_unit_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_unit_unique` UNIQUE(`userId`,`unitId`)
);
