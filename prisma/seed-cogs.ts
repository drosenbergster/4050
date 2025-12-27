import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Master ingredient data from the Heritage Orchard guide
const ingredients = [
  // Pantry Items (Purchased)
  { name: 'Sugar', unitCost: 0.60, unit: 'lb', isFromGarden: false, category: 'Pantry' },
  { name: 'Vinegar', unitCost: 0.15, unit: 'cup', isFromGarden: false, category: 'Pantry' },
  { name: 'Pickling Salt', unitCost: 0.20, unit: 'cup', isFromGarden: false, category: 'Pantry' },
  { name: 'Cinnamon', unitCost: 0.10, unit: 'tbsp', isFromGarden: false, category: 'Pantry' },
  { name: 'Pectin', unitCost: 0.25, unit: 'packet', isFromGarden: false, category: 'Pantry' },
  { name: 'Lemon Juice', unitCost: 0.05, unit: 'tbsp', isFromGarden: false, category: 'Pantry' },
  { name: 'Lime Juice', unitCost: 0.05, unit: 'tbsp', isFromGarden: false, category: 'Pantry' },
  { name: 'Olive Oil', unitCost: 0.15, unit: 'tbsp', isFromGarden: false, category: 'Pantry' },
  { name: 'Parmesan', unitCost: 2.00, unit: 'cup', isFromGarden: false, category: 'Pantry' },
  { name: 'Pine Nuts', unitCost: 3.00, unit: 'cup', isFromGarden: false, category: 'Pantry' },
  { name: 'Spices (misc)', unitCost: 0.10, unit: 'tbsp', isFromGarden: false, category: 'Pantry' },
  { name: 'Flour', unitCost: 0.25, unit: 'cup', isFromGarden: false, category: 'Pantry' },
  { name: 'Eggs', unitCost: 0.35, unit: 'ea', isFromGarden: false, category: 'Pantry' },
  { name: 'Brown Sugar', unitCost: 0.70, unit: 'lb', isFromGarden: false, category: 'Pantry' },
  
  // Packaging
  { name: 'Mason Jar - Quart', unitCost: 1.30, unit: 'each', isFromGarden: false, category: 'Packaging' },
  { name: 'Mason Jar - Pint', unitCost: 1.25, unit: 'each', isFromGarden: false, category: 'Packaging' },
  { name: 'Mason Jar - 8oz', unitCost: 1.00, unit: 'each', isFromGarden: false, category: 'Packaging' },
  { name: 'Mason Jar - 4oz', unitCost: 0.75, unit: 'each', isFromGarden: false, category: 'Packaging' },
  { name: 'Bag/Pouch - 4oz', unitCost: 0.30, unit: 'each', isFromGarden: false, category: 'Packaging' },
  { name: 'Bottle - 16oz', unitCost: 0.75, unit: 'each', isFromGarden: false, category: 'Packaging' },
  { name: 'Lid - Regular', unitCost: 0.50, unit: 'each', isFromGarden: false, category: 'Packaging' },
  { name: 'Label', unitCost: 0.20, unit: 'each', isFromGarden: false, category: 'Packaging' },
  
  // Garden (Homegrown - no cost!)
  { name: 'Apples', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden', notes: 'Heritage trees at 4050' },
  { name: 'Apple Scraps', unitCost: 0, unit: 'batch', isFromGarden: true, category: 'Garden', notes: 'Cores and peels from processing' },
  { name: 'Cucumbers', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Green Beans', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Tomatoes', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Peppers (sweet)', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Peppers (hot)', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Basil', unitCost: 0, unit: 'cup', isFromGarden: true, category: 'Garden' },
  { name: 'Dill', unitCost: 0, unit: 'bunch', isFromGarden: true, category: 'Garden' },
  { name: 'Garlic', unitCost: 0, unit: 'clove', isFromGarden: true, category: 'Garden' },
  { name: 'Onions', unitCost: 0, unit: 'each', isFromGarden: true, category: 'Garden' },
  { name: 'Blueberries', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Raspberries', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Plums', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Snap Peas', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Cilantro', unitCost: 0, unit: 'bunch', isFromGarden: true, category: 'Garden' },
  { name: 'Jalapeno Pepper', unitCost: 0, unit: 'each', isFromGarden: true, category: 'Garden' },
  { name: 'Poblano Pepper', unitCost: 0, unit: 'each', isFromGarden: true, category: 'Garden' },
  { name: 'Butternut Squash', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Delicata Squash', unitCost: 0, unit: 'each', isFromGarden: true, category: 'Garden' },
  { name: 'Zucchini', unitCost: 0, unit: 'lb', isFromGarden: true, category: 'Garden' },
  { name: 'Sorrel', unitCost: 0, unit: 'cup', isFromGarden: true, category: 'Garden' },
];

// Recipe data from the Heritage Orchard guide
const recipes = [
  {
    name: 'Applesauce',
    description: 'Classic heritage applesauce from garden apples',
    containerType: 'Quart Jar',
    containerCost: 1.30, // jar + lid included
    labelCost: 0.20,
    energyCost: 0.30,
    retailPrice: 16.00,
    ingredients: [
      { name: 'Apples', quantity: 2.5 },
      { name: 'Sugar', quantity: 0.25 },
      { name: 'Cinnamon', quantity: 0.25 },
    ]
  },
  {
    name: 'Apple Butter',
    description: 'Rich, slow-cooked apple butter',
    containerType: '8oz Jar',
    containerCost: 1.00,
    labelCost: 0.20,
    energyCost: 0.40,
    retailPrice: 10.00,
    ingredients: [
      { name: 'Apples', quantity: 1.0 },
      { name: 'Sugar', quantity: 0.2 },
      { name: 'Spices (misc)', quantity: 1 },
    ]
  },
  {
    name: 'Apple Chips',
    description: 'Crispy dehydrated apple chips',
    containerType: '4oz Bag',
    containerCost: 0.30,
    labelCost: 0.15,
    energyCost: 0.50,
    retailPrice: 8.00,
    ingredients: [
      { name: 'Apples', quantity: 1.5 },
      { name: 'Cinnamon', quantity: 0.05 },
    ]
  },
  {
    name: 'Apple Scrap Vinegar',
    description: 'Homemade vinegar from apple cores and peels',
    containerType: '16oz Bottle',
    containerCost: 0.75,
    labelCost: 0.20,
    energyCost: 0,
    retailPrice: 10.00,
    ingredients: [
      { name: 'Apple Scraps', quantity: 1 },
      { name: 'Sugar', quantity: 0.5 },
    ]
  },
  {
    name: 'Dill Pickles',
    description: 'Classic crunchy dill pickles',
    containerType: 'Quart Jar',
    containerCost: 1.30,
    labelCost: 0.20,
    energyCost: 0.35,
    retailPrice: 12.00,
    ingredients: [
      { name: 'Cucumbers', quantity: 1.5 },
      { name: 'Vinegar', quantity: 1.5 }, // 1.5 cups worth
      { name: 'Pickling Salt', quantity: 0.02 },
      { name: 'Dill', quantity: 1 },
      { name: 'Garlic', quantity: 2 },
    ]
  },
  {
    name: 'Pickled Beans (Dilly Beans)',
    description: 'Tangy pickled green beans',
    containerType: 'Pint Jar',
    containerCost: 1.25,
    labelCost: 0.20,
    energyCost: 0.30,
    retailPrice: 8.00,
    ingredients: [
      { name: 'Green Beans', quantity: 0.75 },
      { name: 'Vinegar', quantity: 0.75 },
      { name: 'Pickling Salt', quantity: 0.01 },
      { name: 'Dill', quantity: 1 },
    ]
  },
  {
    name: 'Tomato Sauce / Marinara',
    description: 'Garden-fresh tomato sauce',
    containerType: 'Quart Jar',
    containerCost: 1.30,
    labelCost: 0.20,
    energyCost: 0.50,
    retailPrice: 12.00,
    ingredients: [
      { name: 'Tomatoes', quantity: 3.0 },
      { name: 'Onions', quantity: 0.5 },
      { name: 'Garlic', quantity: 3 },
      { name: 'Basil', quantity: 0.5 },
      { name: 'Spices (misc)', quantity: 1 },
    ]
  },
  {
    name: 'Salsa',
    description: 'Fresh garden salsa',
    containerType: 'Pint Jar',
    containerCost: 1.25,
    labelCost: 0.20,
    energyCost: 0.40,
    retailPrice: 10.00,
    ingredients: [
      { name: 'Tomatoes', quantity: 1.5 },
      { name: 'Peppers (hot)', quantity: 0.25 },
      { name: 'Onions', quantity: 0.25 },
      { name: 'Cilantro', quantity: 0.5 },
      { name: 'Lime Juice', quantity: 1 },
      { name: 'Spices (misc)', quantity: 1 },
    ]
  },
  {
    name: 'Pickled Peppers',
    description: 'Sweet or hot pickled peppers',
    containerType: 'Pint Jar',
    containerCost: 1.25,
    labelCost: 0.20,
    energyCost: 0.35,
    retailPrice: 9.00,
    ingredients: [
      { name: 'Peppers (sweet)', quantity: 0.75 },
      { name: 'Vinegar', quantity: 0.75 },
      { name: 'Pickling Salt', quantity: 0.01 },
    ]
  },
  {
    name: 'Berry Jam (Blueberry)',
    description: 'Sweet blueberry jam',
    containerType: '8oz Jar',
    containerCost: 1.00,
    labelCost: 0.20,
    energyCost: 0.30,
    retailPrice: 8.00,
    ingredients: [
      { name: 'Blueberries', quantity: 1.0 },
      { name: 'Sugar', quantity: 0.5 },
      { name: 'Pectin', quantity: 1 },
      { name: 'Lemon Juice', quantity: 1 },
    ]
  },
  {
    name: 'Berry Jam (Raspberry)',
    description: 'Bright raspberry jam',
    containerType: '8oz Jar',
    containerCost: 1.00,
    labelCost: 0.20,
    energyCost: 0.30,
    retailPrice: 8.00,
    ingredients: [
      { name: 'Raspberries', quantity: 1.0 },
      { name: 'Sugar', quantity: 0.5 },
      { name: 'Pectin', quantity: 1 },
      { name: 'Lemon Juice', quantity: 1 },
    ]
  },
  {
    name: 'Plum Jam',
    description: 'Sweet plum preserves',
    containerType: '8oz Jar',
    containerCost: 1.00,
    labelCost: 0.20,
    energyCost: 0.30,
    retailPrice: 8.00,
    ingredients: [
      { name: 'Plums', quantity: 1.0 },
      { name: 'Sugar', quantity: 0.5 },
      { name: 'Pectin', quantity: 1 },
    ]
  },
  {
    name: 'Plum Butter',
    description: 'Rich slow-cooked plum butter',
    containerType: '8oz Jar',
    containerCost: 1.00,
    labelCost: 0.20,
    energyCost: 0.40,
    retailPrice: 10.00,
    ingredients: [
      { name: 'Plums', quantity: 1.5 },
      { name: 'Sugar', quantity: 0.3 },
      { name: 'Spices (misc)', quantity: 1 },
    ]
  },
  {
    name: 'Basil Pesto',
    description: 'Fresh garden basil pesto',
    containerType: '4oz Jar',
    containerCost: 0.75,
    labelCost: 0.15,
    energyCost: 0,
    retailPrice: 9.00,
    notes: 'Can freeze in portions for year-round sales',
    ingredients: [
      { name: 'Basil', quantity: 2 },
      { name: 'Olive Oil', quantity: 1 },
      { name: 'Parmesan', quantity: 1 },
      { name: 'Pine Nuts', quantity: 1 },
      { name: 'Garlic', quantity: 2 },
    ]
  },
  {
    name: 'Pepper Jelly',
    description: 'Sweet and spicy pepper jelly',
    containerType: '8oz Jar',
    containerCost: 1.00,
    labelCost: 0.20,
    energyCost: 0.30,
    retailPrice: 10.00,
    ingredients: [
      { name: 'Peppers (sweet)', quantity: 0.5 },
      { name: 'Sugar', quantity: 0.75 },
      { name: 'Pectin', quantity: 1 },
      { name: 'Vinegar', quantity: 0.25 },
    ]
  },
  {
    name: 'Pickled Snap Peas',
    description: 'Unique pickled snap peas - great for specialty market',
    containerType: 'Pint Jar',
    containerCost: 1.25,
    labelCost: 0.20,
    energyCost: 0.30,
    retailPrice: 9.00,
    ingredients: [
      { name: 'Snap Peas', quantity: 0.5 },
      { name: 'Vinegar', quantity: 0.75 },
      { name: 'Pickling Salt', quantity: 0.01 },
    ]
  },
];

async function seedCogs() {
  console.log('🧮 Starting COGS data seed...\n');
  
  // Create ingredients
  console.log('📦 Creating ingredients...');
  const ingredientMap: Record<string, string> = {};
  
  for (const ing of ingredients) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: ing.name }
    });
    
    if (existing) {
      ingredientMap[ing.name] = existing.id;
      console.log(`  ↻ Exists: ${ing.name}`);
    } else {
      const created = await prisma.ingredient.create({ data: ing });
      ingredientMap[ing.name] = created.id;
      console.log(`  ✓ Created: ${ing.name} ${ing.isFromGarden ? '🏡' : ''}`);
    }
  }
  
  // Create recipes
  console.log('\n📝 Creating recipes...');
  
  for (const recipe of recipes) {
    const existing = await prisma.cogsRecipe.findFirst({
      where: { name: recipe.name }
    });
    
    if (existing) {
      console.log(`  ↻ Exists: ${recipe.name}`);
      continue;
    }
    
    const { ingredients: recipeIngredients, ...recipeData } = recipe;
    
    const createdRecipe = await prisma.cogsRecipe.create({
      data: recipeData
    });
    
    // Add ingredients to recipe
    for (const ing of recipeIngredients) {
      const ingredientId = ingredientMap[ing.name];
      if (!ingredientId) {
        console.log(`    ⚠️ Ingredient not found: ${ing.name}`);
        continue;
      }
      
      await prisma.cogsRecipeIngredient.create({
        data: {
          recipeId: createdRecipe.id,
          ingredientId,
          quantity: ing.quantity
        }
      });
    }
    
    console.log(`  ✓ Created: ${recipe.name} (${recipeIngredients.length} ingredients)`);
  }
  
  console.log('\n✅ COGS seed completed!');
  console.log(`   ${ingredients.length} ingredients`);
  console.log(`   ${recipes.length} recipes`);
}

// Run if called directly
if (require.main === module) {
  seedCogs()
    .catch((e) => {
      console.error('❌ COGS seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedCogs };

