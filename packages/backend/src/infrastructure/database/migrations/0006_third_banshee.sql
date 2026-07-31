ALTER TABLE `conversations` ADD `memory_decay_mode` text DEFAULT 'silent' NOT NULL;--> statement-breakpoint
ALTER TABLE `conversations` ADD `memory_decay_threshold` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `conversations` ADD `memory_decay_age_threshold` integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `conversations` ADD `memory_decay_speed` integer DEFAULT 10 NOT NULL;