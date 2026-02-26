CREATE TYPE "public"."post_type" AS ENUM('announcement', 'coupon', 'sale');--> statement-breakpoint
CREATE TABLE "business_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"businessid" uuid NOT NULL,
	"type" "post_type" NOT NULL,
	"highlight" varchar(255),
	"text" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "category" SET DEFAULT 'Miscellaneous';--> statement-breakpoint
ALTER TABLE "business_posts" ADD CONSTRAINT "business_posts_businessid_businesses_id_fk" FOREIGN KEY ("businessid") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;