-- Update size labels to simplified format: "X oz jar" or "X oz bag"
-- Remove "Small", "Large", "Regular", "Family", "Snack" prefixes

UPDATE product_sizes SET "sizeLabel" = "sizeOz" || ' oz jar'
WHERE "sizeKey" LIKE '%oz' AND "sizeLabel" LIKE '%Jar%';

UPDATE product_sizes SET "sizeLabel" = "sizeOz" || ' oz bag'
WHERE "sizeKey" LIKE '%oz' AND "sizeLabel" LIKE '%Bag%';

-- Also update sizeKey to be simpler (just the oz value)
UPDATE product_sizes SET "sizeKey" = "sizeOz" || 'oz'
WHERE "sizeKey" LIKE '%-%';

-- Update legacy product_variants table too
UPDATE product_variants SET "sizeLabel" = "sizeOz" || ' oz jar'
WHERE "sizeKey" LIKE '%oz' AND "sizeLabel" LIKE '%Jar%';

UPDATE product_variants SET "sizeLabel" = "sizeOz" || ' oz bag'
WHERE "sizeKey" LIKE '%oz' AND "sizeLabel" LIKE '%Bag%';

UPDATE product_variants SET "sizeKey" = "sizeOz" || 'oz'
WHERE "sizeKey" LIKE '%-%';

