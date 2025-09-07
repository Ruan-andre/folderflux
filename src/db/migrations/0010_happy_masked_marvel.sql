ALTER TABLE `actions` ADD `from_tour` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `conditions_tree` ADD `from_tour` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `folders` ADD `from_tour` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `profiles` ADD `from_tour` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `rules` ADD `from_tour` integer DEFAULT false;