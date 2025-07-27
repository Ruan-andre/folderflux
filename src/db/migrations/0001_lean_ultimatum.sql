CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
DROP INDEX `actions_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `actions_rule_id_unique` ON `actions` (`rule_id`);