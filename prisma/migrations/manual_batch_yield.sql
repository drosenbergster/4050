-- Migration: Add batchYield to CogsRecipe
-- Story: 4.1b - Batch-First Recipe Model
-- Date: 2025-12-28
-- 
-- This adds an optional batchYield field to store how many jars a batch makes.
-- Existing recipes will have NULL (treated as per-jar mode for backward compatibility).

-- Add batchYield column (nullable integer)
ALTER TABLE "cogs_recipes" ADD COLUMN IF NOT EXISTS "batchYield" INTEGER;

-- No data migration needed:
-- - Existing recipes: batchYield = NULL → per-jar mode (quantities are per single jar)
-- - New recipes: batchYield = N → batch mode (quantities are for whole batch, divide by N for per-jar)


