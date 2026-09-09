ALTER TABLE `places` ADD `apple_place_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `places_apple_place_id_unique` ON `places` (`apple_place_id`);
