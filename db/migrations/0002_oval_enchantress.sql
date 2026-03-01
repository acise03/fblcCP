CREATE TABLE "business_hours" (
	"id" uuid NOT NULL,
	"day" integer NOT NULL,
	"open_time" varchar(10),
	"close_time" varchar(10),
	"is_closed" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "business_hours_id_day_pk" PRIMARY KEY("id","day")
);
--> statement-breakpoint
CREATE TABLE "favorite_businesses" (
	"userid" uuid NOT NULL,
	"businessid" uuid NOT NULL,
	CONSTRAINT "favorite_businesses_userid_businessid_pk" PRIMARY KEY("userid","businessid")
);
--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_id_businesses_id_fk" FOREIGN KEY ("id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_businesses" ADD CONSTRAINT "favorite_businesses_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_businesses" ADD CONSTRAINT "favorite_businesses_businessid_businesses_id_fk" FOREIGN KEY ("businessid") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;