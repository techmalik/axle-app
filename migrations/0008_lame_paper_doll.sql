CREATE TABLE "blog_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"seo_title" text,
	"meta_description" text NOT NULL,
	"published_date" text NOT NULL,
	"updated_date" text NOT NULL,
	"reading_minutes" integer NOT NULL,
	"excerpt" text NOT NULL,
	"body_html" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_view_stats" (
	"slug" text PRIMARY KEY NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"referrers" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programmatic_industries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"hero_title" text NOT NULL,
	"meta_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"intro" text NOT NULL,
	"pain_points" jsonb NOT NULL,
	"use_cases" jsonb NOT NULL,
	"faqs" jsonb NOT NULL,
	"updated_date" text NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "programmatic_industries_slug_unique" UNIQUE("slug")
);
