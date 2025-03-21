CREATE TABLE "userProfile" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"displayName" varchar(100),
	"bio" text,
	"location" varchar(100),
	"profilePictureUrl" varchar(1024),
	"bannerPictureUrl" varchar(1024),
	"websiteUrl" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "userProfile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" varchar(50);--> statement-breakpoint
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_userProfile_userId" ON "userProfile" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");