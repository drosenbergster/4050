import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Purchase data for common pantry items
const purchaseData: Record<string, { size: number; unit: string; cost: number }> = {
  // Sugars
  'sugar': { size: 4, unit: 'lb', cost: 4.00 },
  'brown sugar': { size: 2, unit: 'lb', cost: 3.50 },
  'powdered sugar': { size: 2, unit: 'lb', cost: 3.00 },
  
  // Flour
  'flour': { size: 5, unit: 'lb', cost: 4.00 },
  'all-purpose flour': { size: 5, unit: 'lb', cost: 4.00 },
  
  // Salt
  'salt': { size: 26, unit: 'oz', cost: 2.00 },
  'pickling salt': { size: 4, unit: 'lb', cost: 6.00 },
  
  // Vinegars
  'vinegar': { size: 1, unit: 'gallon', cost: 4.00 },
  'white vinegar': { size: 1, unit: 'gallon', cost: 4.00 },
  'apple cider vinegar': { size: 32, unit: 'oz', cost: 5.00 },
  
  // Preserving
  'pectin': { size: 1.75, unit: 'oz', cost: 3.00 },
  
  // Sweeteners
  'honey': { size: 12, unit: 'oz', cost: 8.00 },
  'maple syrup': { size: 12, unit: 'oz', cost: 10.00 },
  
  // Citrus
  'lemon juice': { size: 32, unit: 'oz', cost: 4.00 },
  'lime juice': { size: 32, unit: 'oz', cost: 4.00 },
  
  // Spices
  'cinnamon': { size: 2, unit: 'oz', cost: 5.00 },
  'dill seed': { size: 1.5, unit: 'oz', cost: 4.00 },
  'mustard seed': { size: 2, unit: 'oz', cost: 4.00 },
  'black pepper': { size: 2, unit: 'oz', cost: 5.00 },
  'red pepper flakes': { size: 1.5, unit: 'oz', cost: 4.00 },
  'cayenne': { size: 1.5, unit: 'oz', cost: 4.00 },
  'garlic powder': { size: 2.5, unit: 'oz', cost: 4.00 },
  'onion powder': { size: 2.5, unit: 'oz', cost: 4.00 },
  
  // Fresh (per bunch/head)
  'garlic': { size: 3, unit: 'each', cost: 2.00 }, // 3 heads
  'dill': { size: 1, unit: 'bunch', cost: 2.00 },
  
  // Butter
  'butter': { size: 1, unit: 'lb', cost: 5.00 },
};

async function main() {
  console.log('🏪 Seeding purchase data for pantry ingredients...\n');

  const ingredients = await prisma.ingredient.findMany({
    where: { source: 'PANTRY' },
  });

  let updated = 0;
  let skipped = 0;

  for (const ingredient of ingredients) {
    const normalizedName = ingredient.name.toLowerCase();
    
    // Try exact match first
    let purchaseInfo = purchaseData[normalizedName];
    
    // Try partial match if no exact match
    if (!purchaseInfo) {
      for (const [key, value] of Object.entries(purchaseData)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
          purchaseInfo = value;
          break;
        }
      }
    }

    if (purchaseInfo) {
      await prisma.ingredient.update({
        where: { id: ingredient.id },
        data: {
          purchaseSize: purchaseInfo.size,
          purchaseUnit: purchaseInfo.unit,
          purchaseCost: purchaseInfo.cost,
        },
      });
      console.log(`✅ ${ingredient.name}: ${purchaseInfo.size} ${purchaseInfo.unit} @ $${purchaseInfo.cost.toFixed(2)}`);
      updated++;
    } else {
      console.log(`⏭️  ${ingredient.name}: No purchase data defined`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary: ${updated} updated, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


