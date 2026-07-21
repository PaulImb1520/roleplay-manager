CREATE TABLE `provider_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`api_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_instances_kind_name_unique` ON `provider_instances` (`kind`,`name`);--> statement-breakpoint
ALTER TABLE `conversations` ADD `provider_instance_id` text REFERENCES provider_instances(id);