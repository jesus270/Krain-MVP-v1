ALTER TABLE "user" ADD COLUMN "emailVerifiedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "walletChain" varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "walletType" varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "walletVerifiedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "twitterVerifiedAt" timestamp;--> statement-breakpoint