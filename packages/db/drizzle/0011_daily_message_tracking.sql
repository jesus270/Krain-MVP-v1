CREATE TABLE "telegramDailyMessageCount" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "user"("id"),
  "date" date NOT NULL,
  "messageCount" integer NOT NULL DEFAULT 0,
  UNIQUE("userId", "date")
);

CREATE INDEX "idx_telegramDailyMessageCount_userId_date" ON "telegramDailyMessageCount"("userId", "date"); 