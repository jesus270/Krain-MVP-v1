-- Add indexes for high-traffic queries
CREATE INDEX idx_referral_referredByCode ON "referral"("referredByCode");
CREATE INDEX idx_referral_createdAt ON "referral"("createdAt");
CREATE INDEX idx_wallet_referralCode ON "wallet"("referralCode");
CREATE INDEX idx_wallet_createdAt ON "wallet"("createdAt");

-- Add composite indexes for common query patterns
CREATE INDEX idx_referral_code_created ON "referral"("referredByCode", "createdAt");
CREATE INDEX idx_wallet_code_created ON "wallet"("referralCode", "createdAt"); 