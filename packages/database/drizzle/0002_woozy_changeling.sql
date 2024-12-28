ALTER TABLE "wallet" ALTER COLUMN "referralCode" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_referral_referredByCode" ON "referral" USING btree ("referredByCode");--> statement-breakpoint
CREATE INDEX "idx_referral_createdAt" ON "referral" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_referral_code_created" ON "referral" USING btree ("referredByCode","createdAt");--> statement-breakpoint
CREATE INDEX "idx_wallet_referralCode" ON "wallet" USING btree ("referralCode");--> statement-breakpoint
CREATE INDEX "idx_wallet_createdAt" ON "wallet" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_wallet_code_created" ON "wallet" USING btree ("referralCode","createdAt");