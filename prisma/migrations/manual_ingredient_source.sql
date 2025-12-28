-- Add IngredientSource enum and source field to ingredients
-- Run with: npx prisma db execute --file prisma/migrations/manual_ingredient_source.sql

-- Create the enum type
DO $$ BEGIN
    CREATE TYPE "IngredientSource" AS ENUM ('GARDEN', 'PANTRY', 'PACKAGING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add source column (default to PANTRY)
ALTER TABLE "ingredients"
ADD COLUMN IF NOT EXISTS "source" "IngredientSource" NOT NULL DEFAULT 'PANTRY';

-- Remove old isFromGarden column if it exists
ALTER TABLE "ingredients"
DROP COLUMN IF EXISTS "isFromGarden";

-- Create index for filtering by source
CREATE INDEX IF NOT EXISTS "ingredients_source_idx" ON "ingredients"("source");

-- Update GARDEN ingredients (those linked to crops)
UPDATE "ingredients"
SET "source" = 'GARDEN'
WHERE "id" IN (
    SELECT "ingredientId" FROM "crops" WHERE "ingredientId" IS NOT NULL
);

-- Update PACKAGING ingredients (jars, lids, labels, bags, bottles)
UPDATE "ingredients"
SET "source" = 'PACKAGING'
WHERE "name" ILIKE '%jar%'
   OR "name" ILIKE '%lid%'
   OR "name" ILIKE '%label%'
   OR "name" ILIKE '%bag%'
   OR "name" ILIKE '%pouch%'
   OR "name" ILIKE '%bottle%';

-- Everything else stays as PANTRY (sugar, spices, vinegar, etc.)

