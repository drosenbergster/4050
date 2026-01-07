import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/server/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server/auth';

const isDev = process.env.NODE_ENV === 'development';

async function isDevAuthorized(): Promise<boolean> {
  if (!isDev) return false;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  return host.includes('localhost');
}

// POST - Create a product from a COGS recipe
// Now creates ProductFlavor in the new hierarchy instead of legacy Product
export async function POST(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { recipeId, name, description, imageUrl, categoryId, isAvailable, firstSizeOz } = data;

    // Validate required fields
    if (!recipeId || !name || !description || !imageUrl || !categoryId || !firstSizeOz) {
      return NextResponse.json({ 
        error: 'Missing required fields: recipeId, name, description, imageUrl, categoryId, firstSizeOz' 
      }, { status: 400 });
    }

    // Check if recipe exists
    const recipe = await prisma.cogsRecipe.findUnique({
      where: { id: recipeId },
      include: { flavor: true }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if recipe is already linked to a flavor
    if (recipe.flavor) {
      return NextResponse.json({ 
        error: 'This recipe is already published as a product',
        existingFlavor: recipe.flavor
      }, { status: 400 });
    }

    // Check if category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Container type based on size: 4oz → bag, others → jar
    const sizeOz = parseInt(firstSizeOz, 10);
    const containerLabel = sizeOz === 4 ? 'bag' : 'jar';

    // Calculate price from recipe COGS
    // First, get recipe ingredients to calculate batch cost
    const recipeWithIngredients = await prisma.cogsRecipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: { ingredient: true }
        }
      }
    });

    // Calculate batch ingredient cost (garden items are free)
    const batchIngredientCost = recipeWithIngredients?.ingredients.reduce((sum, ri) => {
      const cost = ri.ingredient.source === 'GARDEN' ? 0 : ri.ingredient.unitCost * ri.quantity;
      return sum + cost;
    }, 0) || 0;

    // Yield unit conversions (to oz)
    const yieldToOzConversions: Record<string, number> = {
      oz: 1,
      cup: 8,
      cups: 8,
      pint: 16,
      pints: 16,
      quart: 32,
      quarts: 32,
      gallon: 128,
      gallons: 128,
      lb: 16,
      lbs: 16,
      jar: 8, // Default jar = 8oz
      jars: 8,
    };

    // Get batch yield in oz (assume recipe stores yield as number + containerType as unit)
    const batchYieldValue = recipe.batchYield || 1;
    const yieldUnit = recipe.containerType?.toLowerCase().replace(/\d+oz\s*/i, '').trim() || 'jar';
    const ozPerUnit = yieldToOzConversions[yieldUnit] || 8;
    const batchYieldInOz = batchYieldValue * ozPerUnit;

    // Calculate cost per oz
    const costPerOz = batchYieldInOz > 0 ? batchIngredientCost / batchYieldInOz : 0;

    // Default costs for first size
    const defaultLabelCost = 15; // $0.15 in cents
    const defaultContainerCost = sizeOz === 4 ? 30 : sizeOz === 8 ? 100 : sizeOz === 16 ? 125 : 130; // in cents
    const ingredientCostForSize = costPerOz * sizeOz;
    const cogs = ingredientCostForSize + (defaultContainerCost / 100) + (defaultLabelCost / 100);

    // Suggested price with 40% margin: COGS / (1 - 0.4) = COGS / 0.6
    const suggestedPrice = cogs / 0.6;
    const priceInCents = Math.round(suggestedPrice * 100);

    // Create the flavor linked to the recipe and update recipe status to PUBLISHED
    const flavor = await prisma.$transaction(async (tx) => {
      // Create ProductFlavor
      const newFlavor = await tx.productFlavor.create({
        data: {
          categoryId,
          name,
          description,
          imageUrl,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          cogsRecipeId: recipeId,
        },
      });

      // Create first size with auto-calculated price
      // Note: labelCost and containerCost fields will be added to schema in Task 5
      await tx.productSize.create({
        data: {
          flavorId: newFlavor.id,
          sizeKey: `${sizeOz}oz`,
          sizeLabel: `${sizeOz} oz ${containerLabel}`,
          sizeOz: sizeOz,
          unitPrice: priceInCents,
          quantity: 0, // Start with 0 inventory
          isActive: true,
          sortOrder: sizeOz,
        },
      });

      // Update recipe status
      await tx.cogsRecipe.update({
        where: { id: recipeId },
        data: { status: 'PUBLISHED' }
      });

      // Return the flavor with its size
      return tx.productFlavor.findUnique({
        where: { id: newFlavor.id },
        include: {
          category: true,
          sizes: true,
        }
      });
    });

    return NextResponse.json(flavor, { status: 201 });
  } catch (error) {
    console.error('Error creating product from recipe:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}


