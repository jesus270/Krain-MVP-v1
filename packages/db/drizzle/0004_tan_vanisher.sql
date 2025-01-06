CREATE TABLE "tokenSignup" (
	"id" serial PRIMARY KEY NOT NULL,
	"walletAddress" varchar(255) NOT NULL,
	"paymentTxHash" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokenSignup_walletAddress_unique" UNIQUE("walletAddress")
);
--> statement-breakpoint
CREATE INDEX "idx_tokenSignup_walletAddress" ON "tokenSignup" USING btree ("walletAddress");--> statement-breakpoint
CREATE INDEX "idx_tokenSignup_createdAt" ON "tokenSignup" USING btree ("createdAt");