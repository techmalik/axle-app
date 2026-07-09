ALTER TYPE "public"."invoice_status" ADD VALUE 'paid';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_by" varchar;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_reference" text;