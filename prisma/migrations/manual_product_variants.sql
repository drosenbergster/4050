-- Product Variants: Size-based inventory tracking
-- Allows tracking inventory per size (4oz, 8oz, 16oz, 32oz, etc.)

CREATE TABLE IF NOT EXISTS product_variants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku         VARCHAR(100),
    size_key    VARCHAR(50) NOT NULL,           -- e.g., "small-8oz", "quart-32oz"
    size_label  VARCHAR(100) NOT NULL,          -- e.g., "Small Jar (8 oz)"
    size_oz     INTEGER NOT NULL,               -- e.g., 8, 16, 32
    unit_price  INTEGER NOT NULL,               -- Price in cents
    quantity    INTEGER NOT NULL DEFAULT 0,     -- Stock count
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_product_variant UNIQUE (product_id, size_key)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_quantity ON product_variants(quantity);
CREATE INDEX IF NOT EXISTS idx_product_variants_size_oz ON product_variants(size_oz);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

-- Comment for documentation
COMMENT ON TABLE product_variants IS 'Size-based inventory tracking for products (e.g., 8oz jar, 16oz jar)';
COMMENT ON COLUMN product_variants.size_key IS 'Stable identifier for cart/checkout (e.g., small-8oz)';
COMMENT ON COLUMN product_variants.size_oz IS 'Numeric size in ounces for sorting and filtering';

