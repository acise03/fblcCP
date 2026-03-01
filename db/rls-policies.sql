-- =============================================
-- Supabase Setup: Triggers and Row Level Security
-- Run this in your Supabase SQL Editor after creating tables
-- =============================================

-- ============ AUTO-CREATE USER PROFILE ============
-- Creates a row in public.users when a new auth user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, firstname, lastname)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstname',
    NEW.raw_user_meta_data->>'lastname'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============ ENABLE ROW LEVEL SECURITY ============

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_businesses ENABLE ROW LEVEL SECURITY;


-- ============ USERS TABLE POLICIES ============

-- Anyone can read user profiles (for displaying reviewer names, etc.)
CREATE POLICY "users_select" ON users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "users_update" ON users
  FOR UPDATE USING (auth.uid() = id);


-- ============ ADDRESSES TABLE POLICIES ============

-- Users can only see their own address
CREATE POLICY "addresses_select" ON addresses
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own address
CREATE POLICY "addresses_insert" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own address
CREATE POLICY "addresses_update" ON addresses
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own address
CREATE POLICY "addresses_delete" ON addresses
  FOR DELETE USING (auth.uid() = id);


-- ============ BUSINESSES TABLE POLICIES ============

-- Anyone can read businesses
CREATE POLICY "businesses_select" ON businesses
  FOR SELECT USING (true);

-- Only owner can insert their business
CREATE POLICY "businesses_insert" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = ownerid);

-- Only owner can update their business
CREATE POLICY "businesses_update" ON businesses
  FOR UPDATE USING (auth.uid() = ownerid);

-- Only owner can delete their business
CREATE POLICY "businesses_delete" ON businesses
  FOR DELETE USING (auth.uid() = ownerid);

-- ============ BUSINESS_POSTS TABLE POLICIES ============

-- Anyone can read business posts
CREATE POLICY "business_posts_select" ON business_posts
  FOR SELECT USING (true);

-- Owner can insert posts for their own business
CREATE POLICY "business_posts_insert" ON business_posts
  FOR INSERT WITH CHECK (
    businessid IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can update posts for their own business
CREATE POLICY "business_posts_update" ON business_posts
  FOR UPDATE USING (
    businessid IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can delete posts for their own business
CREATE POLICY "business_posts_delete" ON business_posts
  FOR DELETE USING (
    businessid IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- ============ FAVORITE_BUSINESSES TABLE POLICIES ============

-- Users can read their own favorites
CREATE POLICY "favorite_businesses_select" ON favorite_businesses
  FOR SELECT USING (auth.uid() = userid);

-- Users can add their own favorites
CREATE POLICY "favorite_businesses_insert" ON favorite_businesses
  FOR INSERT WITH CHECK (auth.uid() = userid);

-- Users can remove their own favorites
CREATE POLICY "favorite_businesses_delete" ON favorite_businesses
  FOR DELETE USING (auth.uid() = userid);


-- ============ BUSINESS_INFORMATION TABLE POLICIES ============

-- Anyone can read business info
CREATE POLICY "business_info_select" ON business_information
  FOR SELECT USING (true);

-- Owner can insert info (chain through businesses.ownerid)
CREATE POLICY "business_info_insert" ON business_information
  FOR INSERT WITH CHECK (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can update info
CREATE POLICY "business_info_update" ON business_information
  FOR UPDATE USING (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can delete info
CREATE POLICY "business_info_delete" ON business_information
  FOR DELETE USING (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );


-- ============ BUSINESS_ADDRESSES TABLE POLICIES ============

-- Anyone can read business addresses
CREATE POLICY "business_addr_select" ON business_addresses
  FOR SELECT USING (true);

-- Owner can insert address (chain through businesses.ownerid)
CREATE POLICY "business_addr_insert" ON business_addresses
  FOR INSERT WITH CHECK (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can update address
CREATE POLICY "business_addr_update" ON business_addresses
  FOR UPDATE USING (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can delete address
CREATE POLICY "business_addr_delete" ON business_addresses
  FOR DELETE USING (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );


-- ============ REVIEWS TABLE POLICIES ============

-- Anyone can read reviews
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT USING (true);

-- Users can create reviews (as themselves)
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewerid);

-- Users can update their own reviews
CREATE POLICY "reviews_update" ON reviews
  FOR UPDATE USING (auth.uid() = reviewerid);

-- Users can delete their own reviews
CREATE POLICY "reviews_delete" ON reviews
  FOR DELETE USING (auth.uid() = reviewerid);


-- ============ BUSINESS_HOURS TABLE POLICIES ============

-- Anyone can read business hours
CREATE POLICY "business_hours_select" ON business_hours
  FOR SELECT USING (true);

-- Owner can insert hours
CREATE POLICY "business_hours_insert" ON business_hours
  FOR INSERT WITH CHECK (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can update hours
CREATE POLICY "business_hours_update" ON business_hours
  FOR UPDATE USING (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );

-- Owner can delete hours
CREATE POLICY "business_hours_delete" ON business_hours
  FOR DELETE USING (
    id IN (SELECT id FROM businesses WHERE ownerid = auth.uid())
  );


-- ============ OPTIONAL: UNIQUE CONSTRAINT ============
-- Ensures one review per user per business

ALTER TABLE reviews
  ADD CONSTRAINT reviews_unique_user_business
  UNIQUE (businessid, reviewerid);


-- ============ STORAGE (BUSINESS BANNERS) ============

INSERT INTO storage.buckets (id, name, public)
VALUES ('business-banners', 'business-banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_banners_public_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'business-banners');

CREATE POLICY "storage_banners_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-banners'
    AND EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1]
        AND b.ownerid = auth.uid()
    )
  );

CREATE POLICY "storage_banners_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'business-banners'
    AND EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1]
        AND b.ownerid = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'business-banners'
    AND EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1]
        AND b.ownerid = auth.uid()
    )
  );

CREATE POLICY "storage_banners_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-banners'
    AND EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1]
        AND b.ownerid = auth.uid()
    )
  );


-- ============ STORAGE (PROFILE PICTURES) ============

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view profile pictures
CREATE POLICY "storage_profile_pics_public_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-pictures');

-- Users can upload their own profile picture (folder = their user id)
CREATE POLICY "storage_profile_pics_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own profile picture
CREATE POLICY "storage_profile_pics_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own profile picture
CREATE POLICY "storage_profile_pics_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
