CREATE TABLE `affected_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`log_id` integer NOT NULL,
	`path` text NOT NULL,
	FOREIGN KEY (`log_id`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`metadata` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL
);
