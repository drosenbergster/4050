-- Garden Layout Sandbox: Add spacingInches to crops + create layouts table
-- Run with: psql $DATABASE_URL -f prisma/migrations/manual_garden_layout_sandbox.sql

-- ============================================
-- 1. Add spacingInches column to crops
-- ============================================
ALTER TABLE "crops"
ADD COLUMN IF NOT EXISTS "spacingInches" INTEGER DEFAULT 12;

-- ============================================
-- 2. Pre-populate spacing data for existing crops (Zone 8b / Portland OR)
-- ============================================

-- Vegetables
UPDATE "crops" SET "spacingInches" = 24 WHERE "name" = 'Tomatoes';
UPDATE "crops" SET "spacingInches" = 18 WHERE "name" = 'Peppers';
UPDATE "crops" SET "spacingInches" = 12 WHERE "name" = 'Cucumbers';
UPDATE "crops" SET "spacingInches" = 6 WHERE "name" = 'Green Beans';
UPDATE "crops" SET "spacingInches" = 3 WHERE "name" = 'Peas';

-- Herbs
UPDATE "crops" SET "spacingInches" = 12 WHERE "name" = 'Basil';
UPDATE "crops" SET "spacingInches" = 9 WHERE "name" = 'Parsley';
UPDATE "crops" SET "spacingInches" = 12 WHERE "name" = 'Sorrel';

-- Berries
UPDATE "crops" SET "spacingInches" = 30 WHERE "name" = 'Raspberries';
UPDATE "crops" SET "spacingInches" = 60 WHERE "name" = 'Blueberries';

-- Fruit Trees (15 feet = 180 inches for dwarf/semi-dwarf)
UPDATE "crops" SET "spacingInches" = 180 WHERE "name" = 'Apples';
UPDATE "crops" SET "spacingInches" = 180 WHERE "name" = 'Plums';

-- ============================================
-- 3. Create garden_layouts table
-- ============================================
CREATE TABLE IF NOT EXISTS "garden_layouts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "canvasData" JSONB NOT NULL DEFAULT '{"beds": [], "plants": []}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Add trigger for automatic updatedAt
-- ============================================
CREATE OR REPLACE FUNCTION update_garden_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_garden_layouts_updated_at ON "garden_layouts";
CREATE TRIGGER trigger_garden_layouts_updated_at
    BEFORE UPDATE ON "garden_layouts"
    FOR EACH ROW
    EXECUTE FUNCTION update_garden_layouts_updated_at();

-- ============================================
-- 5. Verify migration
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Garden Layout Sandbox migration complete!';
  RAISE NOTICE '   - Added spacingInches column to crops';
  RAISE NOTICE '   - Pre-populated spacing for existing crops';
  RAISE NOTICE '   - Created garden_layouts table';
END $$;


