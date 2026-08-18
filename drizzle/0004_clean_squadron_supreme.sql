CREATE TABLE `student_daily_streaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActiveDate` varchar(10),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_daily_streaks_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_daily_streak_user_unique` UNIQUE(`userId`)
);
