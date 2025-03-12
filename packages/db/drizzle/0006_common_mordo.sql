ALTER TABLE "user" RENAME COLUMN "privyWalletAddress" TO "walletAddress";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_privyWalletAddress_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_airdropWalletAddress_unique";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "airdropWalletAddress";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_walletAddress_unique" UNIQUE("walletAddress");