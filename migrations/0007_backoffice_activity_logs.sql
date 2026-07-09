CREATE TABLE "backoffice_activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"target_org_id" varchar,
	"target_org_name" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"value" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "applied_discount_id" varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "discount_type" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "discount_value" integer;--> statement-breakpoint
CREATE INDEX "backoffice_logs_created_at_idx" ON "backoffice_activity_logs" USING btree ("created_at");