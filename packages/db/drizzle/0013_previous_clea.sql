CREATE TABLE "ambassador" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"walletAddress" varchar(255) NOT NULL,
	"numberOfBadMonths" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ambassador_userId_unique" UNIQUE("userId"),
	CONSTRAINT "ambassador_walletAddress_unique" UNIQUE("walletAddress")
);
--> statement-breakpoint
ALTER TABLE "ambassador" ADD CONSTRAINT "ambassador_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ambassador_userId" ON "ambassador" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_ambassador_walletAddress" ON "ambassador" USING btree ("walletAddress");--> statement-breakpoint
CREATE INDEX "idx_ambassador_createdAt" ON "ambassador" USING btree ("createdAt");