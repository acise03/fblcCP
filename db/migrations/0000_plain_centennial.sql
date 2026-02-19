CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"address" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "business_addresses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"address" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "business_information" (
	"id" uuid PRIMARY KEY NOT NULL,
	"description" text,
	"email" varchar(255),
	"phone" varchar(255),
	"website" varchar(255),
	"banner" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerid" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"businessid" uuid,
	"reviewerid" uuid,
	"rating" integer,
	"review" text,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"firstname" varchar(255),
	"lastname" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_addresses" ADD CONSTRAINT "business_addresses_id_businesses_id_fk" FOREIGN KEY ("id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_information" ADD CONSTRAINT "business_information_id_businesses_id_fk" FOREIGN KEY ("id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerid_users_id_fk" FOREIGN KEY ("ownerid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_businessid_businesses_id_fk" FOREIGN KEY ("businessid") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerid_users_id_fk" FOREIGN KEY ("reviewerid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;