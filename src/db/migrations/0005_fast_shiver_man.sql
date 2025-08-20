ALTER TABLE `affected_files` RENAME COLUMN "path" TO "current_value";--> statement-breakpoint
ALTER TABLE `affected_files` ADD `new_value` text;