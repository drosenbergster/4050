-- Add inventory quantity field to products table
-- Products default to 0 (out of stock) until admin adds inventory

ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0;

-- Optional: Add index for filtering by stock status (performance)
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity);

