/**
 * Data Migration Script: Products → Category/Flavor/Size Hierarchy
 * 
 * This script migrates existing Product and ProductVariant data
 * into the new ProductCategory → ProductFlavor → ProductSize hierarchy.
 * 
 * Run with: npx tsx prisma/migrate-to-hierarchy.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of product names to their category and flavor
// Format: "Product Name" → { category: "Category Name", flavor: "Flavor Name" }
const PRODUCT_MAPPINGS: Record<string, { category: string; flavor: string }> = {
  // Apple Butters
  'Apple Butter': { category: 'Apple Butter', flavor: 'Classic' },
  'Caramel Thyme Apple Butter': { category: 'Apple Butter', flavor: 'Caramel Thyme' },
  'Maple Cinnamon Apple Butter': { category: 'Apple Butter', flavor: 'Maple Cinnamon' },
  'Bourbon Vanilla Apple Butter': { category: 'Apple Butter', flavor: 'Bourbon Vanilla' },
  
  // Applesauces
  'Applesauce': { category: 'Applesauce', flavor: 'Classic' },
  'Maple Cinnamon Applesauce': { category: 'Applesauce', flavor: 'Maple Cinnamon' },
  'Ginger Pear Applesauce': { category: 'Applesauce', flavor: 'Ginger Pear' },
  
  // Jams
  'Blueberry Jam': { category: 'Jams', flavor: 'Blueberry' },
  'Strawberry Jam': { category: 'Jams', flavor: 'Strawberry' },
  'Blackberry Jam': { category: 'Jams', flavor: 'Blackberry' },
  'Peach Jam': { category: 'Jams', flavor: 'Peach' },
  
  // Pickles
  'Classic Dill Pickles': { category: 'Pickles', flavor: 'Classic Dill' },
  'Bread & Butter Pickles': { category: 'Pickles', flavor: 'Bread & Butter' },
  'Spicy Garlic Pickles': { category: 'Pickles', flavor: 'Spicy Garlic' },
  
  // Dried Goods (Apple Chips, etc.)
  'Apple Chips': { category: 'Dried Goods', flavor: 'Classic Apple Chips' },
};

// Standard categories to ensure exist
const STANDARD_CATEGORIES = [
  { name: 'Apple Butter', description: 'Rich, slow-cooked apple butters made from heritage orchard apples', sortOrder: 1 },
  { name: 'Applesauce', description: 'Smooth, naturally sweet homemade applesauces', sortOrder: 2 },
  { name: 'Jams', description: 'Fruit preserves and jams from garden and local berries', sortOrder: 3 },
  { name: 'Pickles', description: 'Crisp, tangy pickled vegetables from the garden', sortOrder: 4 },
  { name: 'Dried Goods', description: 'Dehydrated fruits and snacks', sortOrder: 5 },
];

async function main() {
  console.log('🚀 Starting product hierarchy migration...\n');

  // Step 1: Ensure all standard categories exist
  console.log('📁 Creating standard categories...');
  for (const cat of STANDARD_CATEGORIES) {
    await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    console.log(`   ✓ ${cat.name}`);
  }
  console.log();

  // Step 2: Get all existing products with their variants
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      cogsRecipe: true,
    },
  });
  console.log(`📦 Found ${products.length} existing products to migrate\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    // Try to get mapping, or infer from product name/category
    let mapping = PRODUCT_MAPPINGS[product.name];
    
    if (!mapping) {
      // Try to infer from existing category
      if (product.category) {
        const categoryName = inferCategoryName(product.category);
        mapping = {
          category: categoryName,
          flavor: product.name.replace(categoryName, '').trim() || 'Classic',
        };
      } else {
        console.log(`   ⚠️  Skipping "${product.name}" - no mapping or category found`);
        skippedCount++;
        continue;
      }
    }

    console.log(`📦 Migrating: ${product.name}`);
    console.log(`   → Category: ${mapping.category}, Flavor: ${mapping.flavor}`);

    try {
      // Get or create the category
      let category = await prisma.productCategory.findUnique({
        where: { name: mapping.category },
      });
      
      if (!category) {
        category = await prisma.productCategory.create({
          data: {
            name: mapping.category,
            description: `${mapping.category} products`,
            sortOrder: 99,
          },
        });
        console.log(`   📁 Created new category: ${mapping.category}`);
      }

      // Create the flavor
      const flavor = await prisma.productFlavor.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: mapping.flavor,
          },
        },
        update: {
          description: product.description,
          imageUrl: product.imageUrl || undefined,
          isAvailable: product.isAvailable,
          cogsRecipeId: product.cogsRecipeId || undefined,
        },
        create: {
          categoryId: category.id,
          name: mapping.flavor,
          description: product.description,
          imageUrl: product.imageUrl || undefined,
          isAvailable: product.isAvailable,
          cogsRecipeId: product.cogsRecipeId || undefined,
        },
      });
      console.log(`   🍎 Created/updated flavor: ${mapping.flavor}`);

      // Migrate sizes from variants
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          await prisma.productSize.upsert({
            where: {
              flavorId_sizeKey: {
                flavorId: flavor.id,
                sizeKey: variant.sizeKey,
              },
            },
            update: {
              sizeLabel: variant.sizeLabel,
              sizeOz: variant.sizeOz,
              unitPrice: variant.unitPrice,
              quantity: variant.quantity,
              isActive: variant.isActive,
              sortOrder: variant.sortOrder,
            },
            create: {
              flavorId: flavor.id,
              sizeKey: variant.sizeKey,
              sizeLabel: variant.sizeLabel,
              sizeOz: variant.sizeOz,
              unitPrice: variant.unitPrice,
              quantity: variant.quantity,
              isActive: variant.isActive,
              sortOrder: variant.sortOrder,
            },
          });
          console.log(`   📏 Created/updated size: ${variant.sizeLabel} (qty: ${variant.quantity})`);
        }
      } else {
        // Product has no variants - create a default size
        console.log(`   ⚠️  No variants found - creating default size`);
        await prisma.productSize.upsert({
          where: {
            flavorId_sizeKey: {
              flavorId: flavor.id,
              sizeKey: 'regular-16oz',
            },
          },
          update: {},
          create: {
            flavorId: flavor.id,
            sizeKey: 'regular-16oz',
            sizeLabel: 'Regular Jar (16 oz)',
            sizeOz: 16,
            unitPrice: product.price,
            quantity: product.quantity,
            isActive: true,
            sortOrder: 0,
          },
        });
      }

      migratedCount++;
      console.log(`   ✅ Migrated successfully\n`);
    } catch (error) {
      console.error(`   ❌ Error migrating "${product.name}":`, error);
      skippedCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));
  console.log(`✅ Migrated: ${migratedCount} products`);
  console.log(`⚠️  Skipped: ${skippedCount} products`);
  
  // Show final counts
  const categoryCount = await prisma.productCategory.count();
  const flavorCount = await prisma.productFlavor.count();
  const sizeCount = await prisma.productSize.count();
  
  console.log('\n📈 New Hierarchy:');
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Flavors: ${flavorCount}`);
  console.log(`   Sizes: ${sizeCount}`);
  console.log('\n✨ Migration complete!');
}

function inferCategoryName(oldCategory: string): string {
  // Map old category names to new category names
  const categoryMap: Record<string, string> = {
    'Spreads': 'Apple Butter',
    'Applesauces': 'Applesauce',
    'Jams': 'Jams',
    'Pickled Goods': 'Pickles',
    'Dried Goods': 'Dried Goods',
  };
  return categoryMap[oldCategory] || oldCategory;
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

