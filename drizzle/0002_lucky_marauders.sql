CREATE TABLE `learning_solved_examples` (
	`id` varchar(96) NOT NULL,
	`unitId` varchar(64) NOT NULL,
	`lessonId` varchar(96) NOT NULL,
	`title` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_solved_examples_id` PRIMARY KEY(`id`)
);
