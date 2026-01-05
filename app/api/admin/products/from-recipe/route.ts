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
    const { recipeId, name, description, price, imageUrl, categoryId, isAvailable } = data;

    // Validate required fields
    if (!recipeId || !name || !description || !imageUrl || !categoryId) {
      return NextResponse.json({ 
        error: 'Missing required fields: recipeId, name, description, imageUrl, categoryId' 
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

    // Convert price to cents (if provided in dollars)
    const priceInCents = price 
      ? Math.round(price * 100) 
      : Math.round(recipe.retailPrice * 100);

    // Determine default size based on container type
    const containerType = recipe.containerType?.toLowerCase() || 'jar';
    const defaultSizeOz = containerType.includes('quart') ? 32 
      : containerType.includes('pint') ? 16 
      : containerType.includes('8oz') ? 8 
      : containerType.includes('4oz') ? 4 
      : containerType.includes('bag') ? 4 
      : 8; // Default to 8oz

    const containerLabel = containerType.includes('bag') ? 'bag' : 'jar';

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
          basePrice: priceInCents,
          cogsRecipeId: recipeId,
        },
      });

      // Create default size
      await tx.productSize.create({
        data: {
          flavorId: newFlavor.id,
          sizeKey: `${defaultSizeOz}oz`,
          sizeLabel: `${defaultSizeOz} oz ${containerLabel}`,
          sizeOz: defaultSizeOz,
          unitPrice: priceInCents,
          quantity: 0, // Start with 0 inventory
          isActive: true,
          sortOrder: defaultSizeOz,
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


