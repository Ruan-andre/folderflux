ALTER TABLE `logs` RENAME TO `organization_logs`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_affected_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`log_id` integer NOT NULL,
	`path` text NOT NULL,
	FOREIGN KEY (`log_id`) REFERENCES `organization_logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_affected_files`("id", "log_id", "path") SELECT "id", "log_id", "path" FROM `affected_files`;--> statement-breakpoint
DROP TABLE `affected_files`;--> statement-breakpoint
ALTER TABLE `__new_affected_files` RENAME TO `affected_files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;