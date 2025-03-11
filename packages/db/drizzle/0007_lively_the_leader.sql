CREATE TABLE "featuredAgent" (
	"id" serial PRIMARY KEY NOT NULL,
	"agentId" integer NOT NULL,
	"order" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "featuredAgent" ADD CONSTRAINT "featuredAgent_agentId_agent_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agent"("id") ON DELETE no action ON UPDATE no action;