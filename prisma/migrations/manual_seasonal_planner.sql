-- Seasonal Planner Migration
-- Run this manually if prisma db push fails

-- Create CropType enum
DO $$ BEGIN
    CREATE TYPE "CropType" AS ENUM ('ANNUAL', 'PERENNIAL', 'BIENNIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add cogsRecipeId to products table (if not exists)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cogsRecipeId" TEXT UNIQUE;

-- Create crops table
CREATE TABLE IF NOT EXISTS "crops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CropType" NOT NULL DEFAULT 'ANNUAL',
    "seedStartWeek" INTEGER,
    "seedStartNotes" TEXT,
    "plantOutWeekStart" INTEGER,
    "plantOutWeekEnd" INTEGER,
    "directSow" BOOLEAN NOT NULL DEFAULT false,
    "harvestStart" INTEGER NOT NULL,
    "harvestEnd" INTEGER NOT NULL,
    "peakStart" INTEGER,
    "peakEnd" INTEGER,
    "color" TEXT NOT NULL DEFAULT '#4A7C59',
    "notes" TEXT,
    "ingredientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- Create seasonal_tasks table
CREATE TABLE IF NOT EXISTS "seasonal_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "weekOfMonth" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "year" INTEGER NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasonal_tasks_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "crops_harvestStart_idx" ON "crops"("harvestStart");
CREATE INDEX IF NOT EXISTS "seasonal_tasks_year_month_idx" ON "seasonal_tasks"("year", "month");
CREATE INDEX IF NOT EXISTS "seasonal_tasks_isCompleted_idx" ON "seasonal_tasks"("isCompleted");

-- Add foreign key constraints
ALTER TABLE "products" 
    DROP CONSTRAINT IF EXISTS "products_cogsRecipeId_fkey";
ALTER TABLE "products" 
    ADD CONSTRAINT "products_cogsRecipeId_fkey" 
    FOREIGN KEY ("cogsRecipeId") REFERENCES "cogs_recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "crops" 
    DROP CONSTRAINT IF EXISTS "crops_ingredientId_fkey";
ALTER TABLE "crops" 
    ADD CONSTRAINT "crops_ingredientId_fkey" 
    FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

