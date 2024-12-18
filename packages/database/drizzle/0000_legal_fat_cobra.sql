CREATE TABLE "referral" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp,
	"referredByCode" varchar(255) NOT NULL,
	"referredWalletAddress" varchar(255) NOT NULL,
	CONSTRAINT "referral_referredWalletAddress_unique" UNIQUE("referredWalletAddress")
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"address" varchar(255) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"referralCode" varchar(255) NOT NULL,
	CONSTRAINT "wallet_address_unique" UNIQUE("address")
);
