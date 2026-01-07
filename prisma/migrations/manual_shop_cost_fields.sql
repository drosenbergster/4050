-- Add cost management fields to product_sizes
-- Note: This project uses camelCase for column names (Prisma default)
ALTER TABLE product_sizes
ADD COLUMN IF NOT EXISTS "labelCost" INT DEFAULT 15,
ADD COLUMN IF NOT EXISTS "containerCost" INT DEFAULT 100;

-- Add cost updated tracking to product_flavors
ALTER TABLE product_flavors
ADD COLUMN IF NOT EXISTS "costUpdatedAt" TIMESTAMP;

-- Update existing sizes with reasonable defaults based on size
UPDATE product_sizes
SET "containerCost" = CASE
  WHEN "sizeOz" = 4 THEN 30    -- $0.30 for bags
  WHEN "sizeOz" = 8 THEN 100   -- $1.00 for 8oz jar
  WHEN "sizeOz" = 16 THEN 125  -- $1.25 for 16oz jar
  WHEN "sizeOz" = 32 THEN 130  -- $1.30 for 32oz jar
  ELSE 100
END;

