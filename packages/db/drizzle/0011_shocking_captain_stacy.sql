CREATE TABLE "telegramDailyMessageCount" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"date" date NOT NULL,
	"messageCount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whitelistSignup" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"walletAddress" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unq_whitelistSignup_email_wallet" UNIQUE("email","walletAddress")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "linkedAccounts" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "telegramDailyMessageCount" ADD CONSTRAINT "telegramDailyMessageCount_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unq_telegramDailyMessageCount_userId_date" ON "telegramDailyMessageCount" USING btree ("userId","date");--> statement-breakpoint
CREATE INDEX "idx_whitelistSignup_email" ON "whitelistSignup" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_whitelistSignup_walletAddress" ON "whitelistSignup" USING btree ("walletAddress");--> statement-breakpoint
CREATE INDEX "idx_whitelistSignup_createdAt" ON "whitelistSignup" USING btree ("createdAt");