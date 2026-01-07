-- Garden Planner: Add yield tracking fields to crops
-- Run with: psql $DATABASE_URL -f prisma/migrations/manual_garden_planner_yields.sql

-- Add new columns for yield tracking
ALTER TABLE "crops"
ADD COLUMN IF NOT EXISTS "plantCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "yieldPerUnit" DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS "yieldUnit" VARCHAR(50) NOT NULL DEFAULT 'lbs',
ADD COLUMN IF NOT EXISTS "lastYearYield" DECIMAL(10, 2);

-- Seed yield data based on typical PNW home garden yields
-- Vegetables
UPDATE "crops" SET "yieldPerUnit" = 12.5, "yieldUnit" = 'lbs' WHERE "name" = 'Tomatoes';
UPDATE "crops" SET "yieldPerUnit" = 7.5, "yieldUnit" = 'lbs' WHERE "name" = 'Peppers';
UPDATE "crops" SET "yieldPerUnit" = 7.5, "yieldUnit" = 'lbs' WHERE "name" = 'Cucumbers';
UPDATE "crops" SET "yieldPerUnit" = 0.75, "yieldUnit" = 'lbs' WHERE "name" = 'Green Beans';
UPDATE "crops" SET "yieldPerUnit" = 0.75, "yieldUnit" = 'lbs' WHERE "name" = 'Peas';
UPDATE "crops" SET "yieldPerUnit" = 12.5, "yieldUnit" = 'lbs' WHERE "name" = 'Butternut Squash';

-- Herbs
UPDATE "crops" SET "yieldPerUnit" = 0.75, "yieldUnit" = 'lbs' WHERE "name" = 'Basil';
UPDATE "crops" SET "yieldPerUnit" = 0.75, "yieldUnit" = 'lbs' WHERE "name" = 'Parsley';
UPDATE "crops" SET "yieldPerUnit" = 0.75, "yieldUnit" = 'lbs' WHERE "name" = 'Sorrel';

-- Berries
UPDATE "crops" SET "yieldPerUnit" = 1.5, "yieldUnit" = 'lbs' WHERE "name" = 'Raspberries';
UPDATE "crops" SET "yieldPerUnit" = 7.5, "yieldUnit" = 'lbs' WHERE "name" = 'Blueberries';

-- Fruit Trees
UPDATE "crops" SET "yieldPerUnit" = 40, "yieldUnit" = 'lbs' WHERE "name" = 'Plums';
UPDATE "crops" SET "yieldPerUnit" = 150, "yieldUnit" = 'lbs' WHERE "name" = 'Apples';

-- Set some example plant counts (user can adjust these)
UPDATE "crops" SET "plantCount" = 6 WHERE "name" = 'Tomatoes';
UPDATE "crops" SET "plantCount" = 4 WHERE "name" = 'Peppers';
UPDATE "crops" SET "plantCount" = 3 WHERE "name" = 'Cucumbers';
UPDATE "crops" SET "plantCount" = 12 WHERE "name" = 'Green Beans';
UPDATE "crops" SET "plantCount" = 12 WHERE "name" = 'Peas';
UPDATE "crops" SET "plantCount" = 2 WHERE "name" = 'Butternut Squash';
UPDATE "crops" SET "plantCount" = 4 WHERE "name" = 'Basil';
UPDATE "crops" SET "plantCount" = 2 WHERE "name" = 'Parsley';
UPDATE "crops" SET "plantCount" = 1 WHERE "name" = 'Sorrel';
UPDATE "crops" SET "plantCount" = 6 WHERE "name" = 'Raspberries';
UPDATE "crops" SET "plantCount" = 3 WHERE "name" = 'Blueberries';
UPDATE "crops" SET "plantCount" = 1 WHERE "name" = 'Plums';
UPDATE "crops" SET "plantCount" = 2 WHERE "name" = 'Apples';



