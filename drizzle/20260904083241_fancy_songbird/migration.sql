CREATE TABLE `app_settings` (
	`key` text PRIMARY KEY,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY,
	`trip_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT `fk_chat_messages_trip_id_trips_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `checklist_items` (
	`id` text PRIMARY KEY,
	`trip_id` text NOT NULL,
	`category` text NOT NULL,
	`label` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`sort_order` integer NOT NULL,
	CONSTRAINT `fk_checklist_items_trip_id_trips_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `day_items` (
	`id` text PRIMARY KEY,
	`trip_day_id` text NOT NULL,
	`place_id` text NOT NULL,
	`sort_order` integer NOT NULL,
	`start_time` text,
	`memo` text,
	`visited` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_day_items_trip_day_id_trip_days_id_fk` FOREIGN KEY (`trip_day_id`) REFERENCES `trip_days`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_day_items_place_id_places_id_fk` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY,
	`trip_id` text NOT NULL,
	`trip_day_id` text,
	`place_id` text,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`currency` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text,
	`split_with` text,
	`created_at` text NOT NULL,
	CONSTRAINT `fk_expenses_trip_id_trips_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_expenses_trip_day_id_trip_days_id_fk` FOREIGN KEY (`trip_day_id`) REFERENCES `trip_days`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_expenses_place_id_places_id_fk` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `places` (
	`id` text PRIMARY KEY,
	`google_place_id` text UNIQUE,
	`name` text NOT NULL,
	`category` text,
	`address` text,
	`region` text,
	`lat` real,
	`lng` real,
	`rating` real,
	`rating_count` integer,
	`photo_url` text,
	`opening_hours` text,
	`summary` text,
	`is_custom` integer DEFAULT false NOT NULL,
	`fetched_at` text
);
--> statement-breakpoint
CREATE TABLE `saved_places` (
	`id` text PRIMARY KEY,
	`trip_id` text NOT NULL,
	`place_id` text NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT `fk_saved_places_trip_id_trips_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_saved_places_place_id_places_id_fk` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE,
	CONSTRAINT `saved_places_trip_id_place_id_unique` UNIQUE(`trip_id`,`place_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_days` (
	`id` text PRIMARY KEY,
	`trip_id` text NOT NULL,
	`day_index` integer NOT NULL,
	`date` text NOT NULL,
	`title` text,
	CONSTRAINT `fk_trip_days_trip_id_trips_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
	CONSTRAINT `trip_days_trip_id_day_index_unique` UNIQUE(`trip_id`,`day_index`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`city_name` text NOT NULL,
	`city_place_id` text,
	`country_code` text,
	`lat` real,
	`lng` real,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`companion` text,
	`styles` text,
	`pace` text,
	`currency` text NOT NULL,
	`origin` text NOT NULL,
	`created_at` text NOT NULL
);
