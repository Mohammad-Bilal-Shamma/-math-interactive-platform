CREATE TABLE `student_assistant_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`imageKey` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_assistant_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `student_assistant_messages_user_created_idx` ON `student_assistant_messages` (`userId`,`createdAt`);