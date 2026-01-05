/**
 * Seed script: Migrate product sizes from code to database variants
 * 
 * This script reads the hardcoded product details from lib/product-details.ts
 * and creates corresponding ProductVariant records in the database.
 * 
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-product-variants.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Product size configurations (from lib/product-details.ts)
const PRODUCT_VARIANTS: Record<string, Array<{
  sizeKey: string;
  sizeLabel: string;
  sizeOz: number;
  unitPrice: number;
}>> = {
  'Apple Butter': [
    { sizeKey: 'small-8oz', sizeLabel: 'Small Jar (8 oz)', sizeOz: 8, unitPrice: 799 },
    { sizeKey: 'regular-16oz', sizeLabel: 'Regular Jar (16 oz)', sizeOz: 16, unitPrice: 1099 },
  ],
  'Apple Chips': [
    { sizeKey: 'snack-2oz', sizeLabel: 'Snack Bag (2 oz)', sizeOz: 2, unitPrice: 499 },
    { sizeKey: 'family-4oz', sizeLabel: 'Family Bag (4 oz)', sizeOz: 4, unitPrice: 699 },
  ],
  'Applesauce': [
    { sizeKey: 'small-8oz', sizeLabel: 'Small Jar (8 oz)', sizeOz: 8, unitPrice: 599 },
    { sizeKey: 'regular-16oz', sizeLabel: 'Regular Jar (16 oz)', sizeOz: 16, unitPrice: 899 },
  ],
  'Blackberry Jam': [
    { sizeKey: 'small-4oz', sizeLabel: 'Small Jar (4 oz)', sizeOz: 4, unitPrice: 699 },
    { sizeKey: 'regular-8oz', sizeLabel: 'Regular Jar (8 oz)', sizeOz: 8, unitPrice: 999 },
  ],
  'Dilly Beans': [
    { sizeKey: 'pint-16oz', sizeLabel: 'Pint Jar (16 oz)', sizeOz: 16, unitPrice: 899 },
  ],
  'Garlic Dill Pickles': [
    { sizeKey: 'pint-16oz', sizeLabel: 'Pint Jar (16 oz)', sizeOz: 16, unitPrice: 799 },
    { sizeKey: 'quart-32oz', sizeLabel: 'Quart Jar (32 oz)', sizeOz: 32, unitPrice: 1199 },
  ],
};

async function main() {
  console.log('🌱 Seeding product variants...\n');

  // Get all products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products\n`);

  let variantsCreated = 0;
  let variantsSkipped = 0;

  for (const product of products) {
    const variantConfigs = PRODUCT_VARIANTS[product.name];
    
    if (!variantConfigs) {
      console.log(`⚪ ${product.name}: No variant config found, skipping`);
      continue;
    }

    console.log(`📦 ${product.name}:`);

    for (let i = 0; i < variantConfigs.length; i++) {
      const config = variantConfigs[i];

      // Check if variant already exists
      const existing = await prisma.productVariant.findUnique({
        where: {
          productId_sizeKey: {
            productId: product.id,
            sizeKey: config.sizeKey,
          },
        },
      });

      if (existing) {
        console.log(`   ⏩ ${config.sizeLabel} already exists, skipping`);
        variantsSkipped++;
        continue;
      }

      // Create variant with 0 quantity (admin will set stock later)
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sizeKey: config.sizeKey,
          sizeLabel: config.sizeLabel,
          sizeOz: config.sizeOz,
          unitPrice: config.unitPrice,
          quantity: 0,
          sortOrder: i,
        },
      });

      console.log(`   ✅ Created: ${config.sizeLabel} @ $${(config.unitPrice / 100).toFixed(2)}`);
      variantsCreated++;
    }
  }

  console.log(`\n✨ Done! Created ${variantsCreated} variants, skipped ${variantsSkipped}`);
}

main()
  .catch((e) => {
    console.error('Error seeding variants:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

