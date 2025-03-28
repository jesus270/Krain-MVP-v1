ALTER TABLE "user" ADD COLUMN "telegramUserId" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "telegramUsername" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hasJoinedTelegramCommunity" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hasJoinedTelegramAnnouncement" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "telegramCommunityMessageCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hasJoinedCommunityChannel" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hasJoinedAnnouncementChannel" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "communityMessageCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "announcementCommentCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_telegramUserId_unique" UNIQUE("telegramUserId");