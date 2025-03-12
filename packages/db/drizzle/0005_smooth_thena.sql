CREATE TABLE "agentCategory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"rating" real DEFAULT 0,
	"reviewsCount" integer DEFAULT 0,
	"category" varchar(255) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"imageUrl" varchar(255),
	"blockchainsSupported" jsonb DEFAULT '[]'::jsonb,
	"tokenSymbol" varchar(50),
	"tokenName" varchar(100),
	"cmcTokenLink" varchar(255),
	"websiteUrl" varchar(255),
	"supportEmail" varchar(255),
	"companyName" varchar(255),
	"contactName" varchar(255),
	"contactEmail" varchar(255),
	"contactPhone" varchar(50),
	"pricing" jsonb DEFAULT '[]'::jsonb,
	"industryFocus" jsonb DEFAULT '[]'::jsonb,
	"socialMedia" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentTag" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favoriteAgent" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"agentId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "privyWallet" (
	"address" varchar(255) PRIMARY KEY NOT NULL,
	"chainType" varchar(50),
	"walletClient" varchar(100),
	"walletClientType" varchar(50),
	"connectorType" varchar(50),
	"verifiedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"agentId" integer,
	"rating" real NOT NULL,
	"review" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"privyWalletAddress" varchar(255),
	"airdropWalletAddress" varchar(255),
	"email" varchar(255),
	"privyId" varchar(255) NOT NULL,
	"twitterHandle" varchar(255),
	"twitterName" varchar(255),
	"twitterProfilePictureUrl" varchar(1024),
	"twitterSubject" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"privyCreatedAt" timestamp,
	"isGuest" boolean DEFAULT false,
	"hasAcceptedTerms" boolean DEFAULT false,
	"linkedAccounts" jsonb,
	"role" varchar(255) DEFAULT 'user',
	CONSTRAINT "user_privyWalletAddress_unique" UNIQUE("privyWalletAddress"),
	CONSTRAINT "user_airdropWalletAddress_unique" UNIQUE("airdropWalletAddress"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_privyId_unique" UNIQUE("privyId"),
	CONSTRAINT "user_twitterHandle_unique" UNIQUE("twitterHandle")
);
--> statement-breakpoint
ALTER TABLE "favoriteAgent" ADD CONSTRAINT "favoriteAgent_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favoriteAgent" ADD CONSTRAINT "favoriteAgent_agentId_agent_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_agentId_agent_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_privyWallet_address" ON "privyWallet" USING btree ("address");--> statement-breakpoint
CREATE INDEX "idx_privyWallet_createdAt" ON "privyWallet" USING btree ("createdAt");