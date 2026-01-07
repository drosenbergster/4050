-- Manual migration: Add recipe status to CogsRecipe
-- Run with: psql $DATABASE_URL -f prisma/migrations/manual_recipe_status.sql

-- Create the enum type (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE "RecipeStatus" AS ENUM ('IDEA', 'READY', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column with default
ALTER TABLE "cogs_recipes" 
ADD COLUMN IF NOT EXISTS "status" "RecipeStatus" NOT NULL DEFAULT 'IDEA';

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS "cogs_recipes_status_idx" ON "cogs_recipes"("status");

-- Data migration: Set existing recipes with linked products to PUBLISHED
UPDATE "cogs_recipes" 
SET "status" = 'PUBLISHED' 
WHERE "id" IN (
    SELECT "cogsRecipeId" 
    FROM "products" 
    WHERE "cogsRecipeId" IS NOT NULL
);



