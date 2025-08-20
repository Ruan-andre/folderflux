PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`category` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_settings`("id", "title", "type", "description", "category", "is_active") SELECT "id", "title", "type", "description", "category", "is_active" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;