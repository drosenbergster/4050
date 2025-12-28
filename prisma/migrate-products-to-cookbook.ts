/**
 * Migration Script: Link Products to Recipes
 * 
 * This script:
 * 1. Matches existing products to recipes by name
 * 2. Creates new products linked to recipes (preserving descriptions)
 * 3. Deletes old unlinked products
 * 
 * Run with: npx ts-node prisma/migrate-products-to-cookbook.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manual mapping of products to recipes
const productToRecipeMap: Record<string, string> = {
  // Product Name → Recipe Name
  'Apple Butter': 'Apple Butter',
  'Apple Chips': 'Apple Chips',
  'Applesauce': 'Applesauce',
  'Blueberry Jam': 'Berry Jam (Blueberry)',
  'Classic Dill Pickles': 'Dill Pickles',
  'Pickled Green Beans': 'Pickled Beans (Dilly Beans)',
  'Raspberry Jam': 'Berry Jam (Raspberry)',
};

// Products without matching recipes - will be deleted
const productsToDelete = [
  'Apple Jam',
  'Apple Rings', 
  'Classic Applesauce',
  'Pickles',
  'Sugar-Free Applesauce',
];

async function main() {
  console.log('🚀 Starting migration: Products → Cookbook\n');

  // Get all existing products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} existing products\n`);

  // Get all recipes
  const recipes = await prisma.cogsRecipe.findMany();
  console.log(`Found ${recipes.length} recipes\n`);

  // Create a recipe lookup by name
  const recipeByName = new Map(recipes.map(r => [r.name, r]));

  // Process each product
  for (const product of products) {
    const recipeName = productToRecipeMap[product.name];
    
    if (recipeName) {
      const recipe = recipeByName.get(recipeName);
      
      if (recipe) {
        console.log(`✅ Linking: "${product.name}" → "${recipe.name}"`);
        
        // Create new product linked to recipe
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            isAvailable: product.isAvailable,
            cogsRecipeId: recipe.id,
          }
        });
        
        // Update recipe status to PUBLISHED
        await prisma.cogsRecipe.update({
          where: { id: recipe.id },
          data: { status: 'PUBLISHED' }
        });
        
        // Delete old product
        await prisma.product.delete({
          where: { id: product.id }
        });
        
        console.log(`   Created new product: ${newProduct.id}`);
      } else {
        console.log(`⚠️ Recipe not found: "${recipeName}" for product "${product.name}"`);
      }
    } else if (productsToDelete.includes(product.name)) {
      console.log(`🗑️ Deleting unmatched: "${product.name}"`);
      await prisma.product.delete({
        where: { id: product.id }
      });
    } else {
      console.log(`❓ No mapping for: "${product.name}" - keeping as-is`);
    }
  }

  // Summary
  const finalProducts = await prisma.product.findMany({
    include: { cogsRecipe: true }
  });
  const linkedProducts = finalProducts.filter(p => p.cogsRecipeId);
  
  console.log('\n📊 Migration Complete!');
  console.log(`   Products: ${finalProducts.length}`);
  console.log(`   Linked to recipes: ${linkedProducts.length}`);
  
  // Show recipe status counts
  const recipeCounts = await prisma.cogsRecipe.groupBy({
    by: ['status'],
    _count: true
  });
  console.log('\n📖 Cookbook Status:');
  recipeCounts.forEach(r => {
    console.log(`   ${r.status}: ${r._count}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

