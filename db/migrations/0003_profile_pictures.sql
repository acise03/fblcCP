-- Add profile_picture column to users table
ALTER TABLE "users" ADD COLUMN "profile_picture" varchar(255);

-- Add profile_picture column to business_information table
ALTER TABLE "business_information" ADD COLUMN "profile_picture" varchar(255);
