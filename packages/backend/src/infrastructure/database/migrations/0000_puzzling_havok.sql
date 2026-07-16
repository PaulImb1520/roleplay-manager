CREATE TABLE `character_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`version_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`position` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `character_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `character_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`name` text NOT NULL,
	`subtitle` text,
	`profile_image` text NOT NULL,
	`description` text NOT NULL,
	`instructions` text,
	`greeting` text NOT NULL,
	`version_number` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`version_id` text NOT NULL,
	`title` text,
	`status` text DEFAULT 'active' NOT NULL,
	`model` text,
	`provider` text,
	`recent_message_count` integer DEFAULT 15,
	`summary_frequency` integer DEFAULT 15,
	`temperature` real DEFAULT 0.7,
	`max_tokens` integer DEFAULT 2048,
	`top_p` real DEFAULT 0.9,
	`frequency_penalty` real DEFAULT 0,
	`presence_penalty` real DEFAULT 0,
	`stop_sequences` text DEFAULT '[]',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `character_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`actor` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` integer DEFAULT 5 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `memories_title_unique` ON `memories` (`conversation_id`,`title`);--> statement-breakpoint
CREATE TABLE `memory_change_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`operation` text NOT NULL,
	`target_memory_id` text,
	`actor` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` integer DEFAULT 5 NOT NULL,
	`reason` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`processed_at` integer,
	`processed_by` text DEFAULT 'user' NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_memory_id`) REFERENCES `memories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`position` integer NOT NULL,
	`alternatives` text DEFAULT '[]',
	`created_at` integer NOT NULL,
	`edited_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`content` text NOT NULL,
	`first_message_id` text NOT NULL,
	`last_message_id` text NOT NULL,
	`model` text,
	`provider` text,
	`created_at` integer NOT NULL,
	`edited_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`first_message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`last_message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade
);
