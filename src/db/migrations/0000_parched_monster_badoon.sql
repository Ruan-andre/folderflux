CREATE TABLE `condition` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`rule_id` integer NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `rule`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `condition_id_unique` ON `condition` (`id`);--> statement-breakpoint
CREATE TABLE `rule` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text(150),
	`extensions` text,
	`is_system` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rule_name_unique` ON `rule` (`name`);