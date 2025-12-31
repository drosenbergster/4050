-- Enable Row Level Security on all tables
-- Since this app uses Prisma with service role credentials (which bypass RLS),
-- these policies only affect access via Supabase PostgREST/JS client.

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cogs_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cogs_recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_layouts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. PUBLIC READ ACCESS POLICIES
-- Products should be publicly readable (for the shop page)
-- =====================================================

-- Allow anyone to read products (needed for public shop)
CREATE POLICY "Products are publicly readable"
  ON public.products
  FOR SELECT
  USING (true);

-- =====================================================
-- 3. SERVICE ROLE / ADMIN ONLY POLICIES
-- All other tables should only be accessible via service role
-- (Prisma uses service role, so it bypasses RLS anyway)
-- These policies block all public/anon access via PostgREST
-- =====================================================

-- Users: No public access (service role only)
CREATE POLICY "Users are service role only"
  ON public.users
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Orders: No public access
CREATE POLICY "Orders are service role only"
  ON public.orders
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Order Items: No public access
CREATE POLICY "Order items are service role only"
  ON public.order_items
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Ingredients: No public access
CREATE POLICY "Ingredients are service role only"
  ON public.ingredients
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- COGS Recipes: No public access
CREATE POLICY "COGS recipes are service role only"
  ON public.cogs_recipes
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- COGS Recipe Ingredients: No public access
CREATE POLICY "COGS recipe ingredients are service role only"
  ON public.cogs_recipe_ingredients
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Crops: No public access
CREATE POLICY "Crops are service role only"
  ON public.crops
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Seasonal Tasks: No public access
CREATE POLICY "Seasonal tasks are service role only"
  ON public.seasonal_tasks
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Garden Layouts: No public access
CREATE POLICY "Garden layouts are service role only"
  ON public.garden_layouts
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- NOTES:
-- - The service role (used by Prisma) bypasses RLS entirely
-- - These policies ensure the anon key can only read products
-- - All admin operations go through your Next.js API routes
--   which authenticate via NextAuth and use Prisma
-- =====================================================

