CREATE TABLE "earlyAccessSignup" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "earlyAccessSignup_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_address_unique";--> statement-breakpoint
CREATE INDEX "idx_earlyAccessSignup_email" ON "earlyAccessSignup" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_earlyAccessSignup_createdAt" ON "earlyAccessSignup" USING btree ("createdAt");