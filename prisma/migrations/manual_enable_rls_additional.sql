-- Enable Row Level Security on additional tables
-- These tables were added after the initial RLS migration
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. ENABLE RLS ON MISSING TABLES
-- =====================================================

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. PUBLIC READ ACCESS POLICIES
-- Product hierarchy tables need to be publicly readable (for the shop page)
-- Organizations need to be publicly readable (for checkout/impact page)
-- =====================================================

-- Product Categories: Allow public read for shop navigation
CREATE POLICY "Product categories are publicly readable"
  ON public.product_categories
  FOR SELECT
  USING (true);

-- Product Flavors: Allow public read for shop browsing
CREATE POLICY "Product flavors are publicly readable"
  ON public.product_flavors
  FOR SELECT
  USING (true);

-- Product Sizes: Allow public read for size selection in shop
CREATE POLICY "Product sizes are publicly readable"
  ON public.product_sizes
  FOR SELECT
  USING (true);

-- Product Variants (legacy): Allow public read for shop
CREATE POLICY "Product variants are publicly readable"
  ON public.product_variants
  FOR SELECT
  USING (true);

-- Organizations: Allow public read for checkout and impact page
CREATE POLICY "Organizations are publicly readable"
  ON public.organizations
  FOR SELECT
  USING (true);

-- =====================================================
-- 3. SERVICE ROLE / ADMIN ONLY POLICIES
-- These tables should only be accessible via service role
-- =====================================================

-- Product Batches: No public access (admin production tracking only)
CREATE POLICY "Product batches are service role only"
  ON public.product_batches
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Nominations: No public access (sensitive community data)
CREATE POLICY "Nominations are service role only"
  ON public.nominations
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- NOTES:
-- - The service role (used by Prisma) bypasses RLS entirely
-- - Product hierarchy tables are public read for the shop
-- - Organizations are public read for checkout/impact
-- - Batches and nominations are admin-only
-- =====================================================

