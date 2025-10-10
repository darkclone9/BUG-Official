-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================
-- Run this after creating the storage buckets in Supabase Dashboard

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

-- Public can view avatar files
CREATE POLICY "Public can view avatar files"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own avatar files
CREATE POLICY "Users can update own avatar files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar files
CREATE POLICY "Users can delete own avatar files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- BANNERS BUCKET POLICIES
-- ============================================

-- Public can view banner files
CREATE POLICY "Public can view banner files"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Authenticated users can upload banners
CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own banner files
CREATE POLICY "Users can update own banner files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own banner files
CREATE POLICY "Users can delete own banner files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- PRODUCTS BUCKET POLICIES
-- ============================================

-- Public can view product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Authenticated users can upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- TOURNAMENTS BUCKET POLICIES
-- ============================================

-- Public can view tournament images
CREATE POLICY "Public can view tournament images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournaments');

-- Authenticated users can upload tournament images
CREATE POLICY "Authenticated users can upload tournament images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tournaments' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update tournament images
CREATE POLICY "Authenticated users can update tournament images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tournaments' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete tournament images
CREATE POLICY "Authenticated users can delete tournament images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tournaments' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- STORAGE POLICIES COMPLETE!
-- ============================================

