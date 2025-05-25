ALTER TABLE `condition` RENAME COLUMN "name" TO "type";--> statement-breakpoint
CREATE TABLE `action` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`value` text,
	`rule_id` integer NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `rule`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `action_id_unique` ON `action` (`id`);--> statement-breakpoint
ALTER TABLE `condition` ADD `type_action` text NOT NULL;