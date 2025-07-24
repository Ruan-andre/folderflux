CREATE TABLE `actions` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`value` text,
	`rule_id` integer NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `actions_id_unique` ON `actions` (`id`);--> statement-breakpoint
CREATE TABLE `condition_groups` (
	`id` integer PRIMARY KEY NOT NULL,
	`operator` text DEFAULT 'AND' NOT NULL,
	`rule_id` integer NOT NULL,
	`parent_group_id` integer,
	FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_group_id`) REFERENCES `condition_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `conditions` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`type_action` text NOT NULL,
	`value` text,
	`value2` text,
	`group_id` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `condition_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conditions_id_unique` ON `conditions` (`id`);--> statement-breakpoint
CREATE TABLE `folders` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`full_path` text(150) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `folders_full_path_unique` ON `folders` (`full_path`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text(150),
	`icon_id` text DEFAULT 'fluent-emoji:file-folder' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_name_unique` ON `profiles` (`name`);--> statement-breakpoint
CREATE TABLE `profile_folders` (
	`profile_id` integer NOT NULL,
	`folder_id` integer NOT NULL,
	PRIMARY KEY(`profile_id`, `folder_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile_rules` (
	`profile_id` integer NOT NULL,
	`rule_id` integer NOT NULL,
	PRIMARY KEY(`profile_id`, `rule_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text(255),
	`is_system` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rules_name_unique` ON `rules` (`name`);