-- Manual migration for COGS Calculator and schema alignment
-- Run this in Supabase SQL Editor if automatic migration fails

-- =============================================
-- 1. Add missing columns to products table
-- =============================================
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category" TEXT;
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");

-- =============================================
-- 2. Add Seeds of Kindness columns to orders
-- =============================================
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "proceedsChoice" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "seedCount" INTEGER;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "extraSupportAmount" INTEGER;

-- =============================================
-- 3. Create COGS Calculator tables
-- =============================================

-- Ingredients table
CREATE TABLE IF NOT EXISTS "ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "isFromGarden" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- COGS Recipes table
CREATE TABLE IF NOT EXISTS "cogs_recipes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "containerType" TEXT NOT NULL,
    "containerCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labelCost" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "energyCost" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "retailPrice" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cogs_recipes_pkey" PRIMARY KEY ("id")
);

-- COGS Recipe Ingredients junction table
CREATE TABLE IF NOT EXISTS "cogs_recipe_ingredients" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "cogs_recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 4. Add indexes for COGS tables
-- =============================================
CREATE INDEX IF NOT EXISTS "ingredients_name_idx" ON "ingredients"("name");
CREATE INDEX IF NOT EXISTS "ingredients_category_idx" ON "ingredients"("category");

-- =============================================
-- 5. Add unique constraint and foreign keys
-- =============================================
-- Unique constraint on recipe ingredients
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cogs_recipe_ingredients_recipeId_ingredientId_key'
    ) THEN
        ALTER TABLE "cogs_recipe_ingredients" 
        ADD CONSTRAINT "cogs_recipe_ingredients_recipeId_ingredientId_key" 
        UNIQUE ("recipeId", "ingredientId");
    END IF;
END $$;

-- Foreign key: recipe ingredients -> recipes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cogs_recipe_ingredients_recipeId_fkey'
    ) THEN
        ALTER TABLE "cogs_recipe_ingredients" 
        ADD CONSTRAINT "cogs_recipe_ingredients_recipeId_fkey" 
        FOREIGN KEY ("recipeId") REFERENCES "cogs_recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Foreign key: recipe ingredients -> ingredients
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cogs_recipe_ingredients_ingredientId_fkey'
    ) THEN
        ALTER TABLE "cogs_recipe_ingredients" 
        ADD CONSTRAINT "cogs_recipe_ingredients_ingredientId_fkey" 
        FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- =============================================
-- Done!
-- =============================================
SELECT 'Migration completed successfully!' as status;

