-- Product Hierarchy Migration
-- Restructures products into: Category → Flavor → Size → Batch
-- =====================================================

-- 1. Create ProductCategory table (base product types)
CREATE TABLE IF NOT EXISTS product_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create ProductFlavor table (specific recipes/variants)
CREATE TABLE IF NOT EXISTS product_flavors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "categoryId" TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "cogsRecipeId" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_flavor_category FOREIGN KEY ("categoryId") 
        REFERENCES product_categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_flavor_cogs_recipe FOREIGN KEY ("cogsRecipeId") 
        REFERENCES cogs_recipes(id),
    CONSTRAINT unique_flavor_per_category UNIQUE ("categoryId", name)
);

CREATE INDEX IF NOT EXISTS idx_product_flavors_category ON product_flavors("categoryId");
CREATE INDEX IF NOT EXISTS idx_product_flavors_available ON product_flavors("isAvailable");

-- 3. Create ProductSize table (container sizes per flavor)
CREATE TABLE IF NOT EXISTS product_sizes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "flavorId" TEXT NOT NULL,
    "sizeKey" VARCHAR(50) NOT NULL,
    "sizeLabel" VARCHAR(100) NOT NULL,
    "sizeOz" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_size_flavor FOREIGN KEY ("flavorId") 
        REFERENCES product_flavors(id) ON DELETE CASCADE,
    CONSTRAINT unique_size_per_flavor UNIQUE ("flavorId", "sizeKey")
);

CREATE INDEX IF NOT EXISTS idx_product_sizes_flavor ON product_sizes("flavorId");
CREATE INDEX IF NOT EXISTS idx_product_sizes_quantity ON product_sizes(quantity);
CREATE INDEX IF NOT EXISTS idx_product_sizes_oz ON product_sizes("sizeOz");

-- 4. Create ProductBatch table (production tracking)
CREATE TABLE IF NOT EXISTS product_batches (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "flavorId" TEXT NOT NULL,
    "sizeId" TEXT,
    "batchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantity INTEGER NOT NULL,
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_batch_flavor FOREIGN KEY ("flavorId") 
        REFERENCES product_flavors(id) ON DELETE CASCADE,
    CONSTRAINT fk_batch_size FOREIGN KEY ("sizeId") 
        REFERENCES product_sizes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_product_batches_date ON product_batches("batchDate");
CREATE INDEX IF NOT EXISTS idx_product_batches_flavor ON product_batches("flavorId");

-- 5. Add new columns to order_items for the new hierarchy
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS "flavorId" TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS "sizeKey" VARCHAR(50);

-- Make productId nullable for new orders that use the new hierarchy
-- (may fail if column already nullable - safe to ignore)
DO $$ BEGIN
    ALTER TABLE order_items ALTER COLUMN "productId" DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add foreign key for flavorId (skip if already exists)
DO $$ BEGIN
    ALTER TABLE order_items 
        ADD CONSTRAINT fk_order_item_flavor 
        FOREIGN KEY ("flavorId") REFERENCES product_flavors(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_flavor ON order_items("flavorId");

-- 6. Seed initial categories based on existing product categories
INSERT INTO product_categories (name, description, "sortOrder")
SELECT DISTINCT 
    category, 
    'Products in the ' || category || ' category',
    CASE category
        WHEN 'Spreads' THEN 1
        WHEN 'Applesauces' THEN 2
        WHEN 'Jams' THEN 3
        WHEN 'Dried Goods' THEN 4
        WHEN 'Pickled Goods' THEN 5
        ELSE 10
    END
FROM products 
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Also add standard categories if they don't exist
INSERT INTO product_categories (name, description, "sortOrder") VALUES
    ('Apple Butter', 'Rich, slow-cooked apple butters', 1),
    ('Applesauce', 'Homemade applesauces', 2),
    ('Jams', 'Fruit preserves and jams', 3),
    ('Pickles', 'Pickled vegetables', 4)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- NOTE: After running this migration, run the data migration script
-- to move existing products into the new hierarchy structure.
-- See: prisma/migrate-to-hierarchy.ts
-- =====================================================

