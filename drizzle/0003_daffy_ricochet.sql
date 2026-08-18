ALTER TABLE `learning_lessons` ADD `summary` text;--> statement-breakpoint
ALTER TABLE `learning_lessons` ADD `contentJson` text;--> statement-breakpoint
ALTER TABLE `learning_lessons` ADD `visualizationType` varchar(48);--> statement-breakpoint
ALTER TABLE `learning_lessons` ADD `visualizationConfigJson` text;--> statement-breakpoint
ALTER TABLE `learning_lessons` ADD `isPublished` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_lessons` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `title` varchar(255);--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `prompt` text;--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `answerSchemaJson` text;--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `tolerance` varchar(32);--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `explanation` text;--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `correctStep` text;--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `isPublished` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `createdByUserId` int;--> statement-breakpoint
ALTER TABLE `learning_questions` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;
