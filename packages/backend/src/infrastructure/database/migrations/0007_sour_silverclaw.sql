CREATE TABLE `character_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`extension` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `character_versions` ADD `profile_image_asset_id` text;