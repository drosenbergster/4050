-- Add purchase tracking columns to ingredients table
-- This allows tracking what you buy (e.g., 2 lb bag of sugar for $4)
-- and auto-calculating the cost per recipe unit (e.g., cost per tbsp)

-- Add new columns
ALTER TABLE "ingredients"
ADD COLUMN IF NOT EXISTS "purchaseSize" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "purchaseUnit" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "purchaseCost" DOUBLE PRECISION;

-- Seed some common pantry items with purchase info
-- Sugar: typically 4 lb bag for ~$4
UPDATE "ingredients"
SET "purchaseSize" = 4, "purchaseUnit" = 'lb', "purchaseCost" = 4.00
WHERE LOWER("name") LIKE '%sugar%';

-- Flour: typically 5 lb bag for ~$4
UPDATE "ingredients"
SET "purchaseSize" = 5, "purchaseUnit" = 'lb', "purchaseCost" = 4.00
WHERE LOWER("name") LIKE '%flour%';

-- Salt: typically 26 oz container for ~$2
UPDATE "ingredients"
SET "purchaseSize" = 26, "purchaseUnit" = 'oz', "purchaseCost" = 2.00
WHERE LOWER("name") LIKE '%salt%' AND LOWER("name") NOT LIKE '%pickling%';

-- Pickling salt: 4 lb bag for ~$6
UPDATE "ingredients"
SET "purchaseSize" = 4, "purchaseUnit" = 'lb', "purchaseCost" = 6.00
WHERE LOWER("name") LIKE '%pickling salt%';

-- Vinegar: typically 1 gallon for ~$4
UPDATE "ingredients"
SET "purchaseSize" = 1, "purchaseUnit" = 'gallon', "purchaseCost" = 4.00
WHERE LOWER("name") LIKE '%vinegar%';

-- Pectin: typically 1.75 oz packet for ~$3
UPDATE "ingredients"
SET "purchaseSize" = 1.75, "purchaseUnit" = 'oz', "purchaseCost" = 3.00
WHERE LOWER("name") LIKE '%pectin%';

-- Honey: typically 12 oz jar for ~$8
UPDATE "ingredients"
SET "purchaseSize" = 12, "purchaseUnit" = 'oz', "purchaseCost" = 8.00
WHERE LOWER("name") LIKE '%honey%';

-- Lemon juice: typically 32 oz bottle for ~$4
UPDATE "ingredients"
SET "purchaseSize" = 32, "purchaseUnit" = 'oz', "purchaseCost" = 4.00
WHERE LOWER("name") LIKE '%lemon juice%';

-- Spices (general): typically 1-2 oz jar for ~$4-6
UPDATE "ingredients"
SET "purchaseSize" = 1.5, "purchaseUnit" = 'oz', "purchaseCost" = 5.00
WHERE LOWER("name") IN (
  'cinnamon', 'dill seed', 'mustard seed', 'garlic powder', 
  'onion powder', 'black pepper', 'red pepper flakes', 'cayenne'
) AND "purchaseSize" IS NULL;



