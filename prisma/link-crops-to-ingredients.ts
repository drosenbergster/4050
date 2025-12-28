import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map crop names to ingredient names (handles slight differences)
const cropToIngredientMap: Record<string, string> = {
  'Apples': 'Apples',
  'Basil': 'Basil',
  'Blueberries': 'Blueberries',
  'Butternut Squash': 'Butternut Squash',
  'Cucumbers': 'Cucumbers',
  'Green Beans': 'Green Beans',
  'Peas': 'Snap Peas',
  'Peppers': 'Peppers (sweet)',
  'Plums': 'Plums',
  'Raspberries': 'Raspberries',
  'Sorrel': 'Sorrel',
  'Tomatoes': 'Tomatoes',
  // Parsley not in ingredients yet
};

async function main() {
  console.log('🔗 Linking crops to ingredients...\n');

  // Get all ingredients
  const ingredients = await prisma.ingredient.findMany();
  const ingredientByName = new Map(ingredients.map(i => [i.name, i.id]));

  // Get all crops
  const crops = await prisma.crop.findMany();

  for (const crop of crops) {
    const ingredientName = cropToIngredientMap[crop.name];
    
    if (ingredientName) {
      const ingredientId = ingredientByName.get(ingredientName);
      
      if (ingredientId) {
        await prisma.crop.update({
          where: { id: crop.id },
          data: { ingredientId }
        });
        console.log(`✅ ${crop.name} → ${ingredientName}`);
      } else {
        console.log(`⚠️  ${crop.name}: Ingredient "${ingredientName}" not found`);
      }
    } else {
      console.log(`⏭️  ${crop.name}: No matching ingredient defined`);
    }
  }

  console.log('\n✨ Done linking crops to ingredients!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

