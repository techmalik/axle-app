CREATE TYPE "public"."invoice_status" AS ENUM('pending_review', 'approved', 'rejected', 'revision_requested');--> statement-breakpoint
CREATE TYPE "public"."ooo_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."timesheet_status" AS ENUM('draft', 'submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"entity_type" text,
	"entity_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"timesheet_id" varchar NOT NULL,
	"date" date NOT NULL,
	"hours" integer DEFAULT 0 NOT NULL,
	"activity_log" text
);
--> statement-breakpoint
CREATE TABLE "evaluation_sections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"evaluation_id" varchar NOT NULL,
	"section_number" integer NOT NULL,
	"section_name" text NOT NULL,
	"question" text NOT NULL,
	"self_rating" integer,
	"self_documentation" text,
	"improvement_goal" text,
	"manager_rating" integer,
	"manager_feedback" text,
	"founder_feedback" text
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"ic_id" varchar NOT NULL,
	"manager_id" varchar NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"experience_level_at_eval" integer,
	"new_experience_level" integer,
	"overall_self_rating" integer,
	"overall_manager_rating" integer,
	"overall_score" integer,
	"outcomes" text[],
	"expectations_for_next_review" text,
	"manager_summary" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ic_submitted_at" timestamp,
	"manager_submitted_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "feedback_invitations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"evaluation_id" varchar NOT NULL,
	"invited_by_id" varchar NOT NULL,
	"invited_user_id" varchar NOT NULL,
	"feedback" text,
	"rating" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ic_payment_details" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"bank_name" text,
	"account_holder_first_name" text,
	"account_holder_last_name" text,
	"account_number" text,
	"routing_number" text,
	"swift_code" text,
	"iban_number" text,
	"account_type" text,
	"address" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ic_payment_details_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ic_responsibilities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"ic_id" varchar NOT NULL,
	"responsibility" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"invoice_id" varchar NOT NULL,
	"description" text NOT NULL,
	"quantity" integer NOT NULL,
	"rate" integer NOT NULL,
	"total" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"invoice_number" text NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"issue_date" date NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"amount" integer,
	"subtotal" integer,
	"contractor_name" text,
	"contractor_address" text,
	"contractor_phone" text,
	"contractor_email" text,
	"contractor_vat_no" text,
	"bill_to_name" text,
	"bill_to_address" text,
	"bill_to_vat_no" text,
	"bank_details" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"status" "invoice_status" DEFAULT 'pending_review' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_note" text,
	"timesheet_id" varchar
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"ooo_notifications" boolean DEFAULT true NOT NULL,
	"timesheet_notifications" boolean DEFAULT true NOT NULL,
	"overtime_notifications" boolean DEFAULT true NOT NULL,
	"invoice_notifications" boolean DEFAULT true NOT NULL,
	"deadline_reminders" boolean DEFAULT true NOT NULL,
	"evaluation_notifications" boolean DEFAULT true NOT NULL,
	"team_action_notifications" boolean DEFAULT true NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"actor_id" varchar,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"entity_type" text,
	"entity_id" varchar,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ooo_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"manager_id" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"ooo_type" text DEFAULT 'full_day' NOT NULL,
	"reason" text,
	"status" "ooo_request_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"billing_email" text,
	"address" text,
	"vat_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "overtime_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"timesheet_id" varchar NOT NULL,
	"date" date NOT NULL,
	"requested_hours" integer NOT NULL,
	"approved_hours" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_note" text,
	"is_weekend_work" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"seat_count" integer DEFAULT 0 NOT NULL,
	"max_seats" integer DEFAULT 3 NOT NULL,
	"current_period_start" timestamp DEFAULT now() NOT NULL,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timesheets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"user_id" varchar NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"total_hours" integer DEFAULT 0 NOT NULL,
	"status" timesheet_status DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" text DEFAULT 'ic' NOT NULL,
	"job_title" text,
	"team" text,
	"supervisor_id" varchar,
	"manager_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"avatar_url" text,
	"experience_level" integer DEFAULT 1,
	"contractor_status" text DEFAULT 'engaged',
	"contractor_category" text,
	"hourly_rate" integer,
	"monthly_cap" integer,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"completed_onboarding" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "daily_entries" ADD CONSTRAINT "daily_entries_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_sections" ADD CONSTRAINT "evaluation_sections_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_ic_id_users_id_fk" FOREIGN KEY ("ic_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_invitations" ADD CONSTRAINT "feedback_invitations_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_invitations" ADD CONSTRAINT "feedback_invitations_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_invitations" ADD CONSTRAINT "feedback_invitations_invited_user_id_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_payment_details" ADD CONSTRAINT "ic_payment_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_responsibilities" ADD CONSTRAINT "ic_responsibilities_ic_id_users_id_fk" FOREIGN KEY ("ic_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ooo_requests" ADD CONSTRAINT "ooo_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_organization_id_idx" ON "activity_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_entries_timesheet_id_idx" ON "daily_entries" USING btree ("timesheet_id");--> statement-breakpoint
CREATE INDEX "daily_entries_date_idx" ON "daily_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "evaluation_sections_evaluation_id_idx" ON "evaluation_sections" USING btree ("evaluation_id");--> statement-breakpoint
CREATE INDEX "evaluations_ic_id_idx" ON "evaluations" USING btree ("ic_id");--> statement-breakpoint
CREATE INDEX "evaluations_manager_id_idx" ON "evaluations" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "evaluations_organization_id_idx" ON "evaluations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "feedback_invitations_evaluation_id_idx" ON "feedback_invitations" USING btree ("evaluation_id");--> statement-breakpoint
CREATE INDEX "ic_responsibilities_ic_id_idx" ON "ic_responsibilities" USING btree ("ic_id");--> statement-breakpoint
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoices_user_id_idx" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoices_organization_id_idx" ON "invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_user_year_month_idx" ON "invoices" USING btree ("user_id","year","month");--> statement-breakpoint
CREATE INDEX "invoices_user_organization_idx" ON "invoices" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_is_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ooo_requests_user_id_idx" ON "ooo_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ooo_requests_manager_id_idx" ON "ooo_requests" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "ooo_requests_status_idx" ON "ooo_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "overtime_requests_user_id_idx" ON "overtime_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "overtime_requests_timesheet_id_idx" ON "overtime_requests" USING btree ("timesheet_id");--> statement-breakpoint
CREATE INDEX "overtime_requests_status_idx" ON "overtime_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "timesheets_user_month_year_idx" ON "timesheets" USING btree ("user_id","month","year");--> statement-breakpoint
CREATE INDEX "timesheets_organization_id_idx" ON "timesheets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "timesheets_status_idx" ON "timesheets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_organization_id_idx" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "users_supervisor_id_idx" ON "users" USING btree ("supervisor_id");