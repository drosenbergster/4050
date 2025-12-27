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
export async function POST(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { recipeId, name, description, price, imageUrl, category, isAvailable } = data;

    // Validate required fields
    if (!recipeId || !name || !description || !imageUrl) {
      return NextResponse.json({ 
        error: 'Missing required fields: recipeId, name, description, imageUrl' 
      }, { status: 400 });
    }

    // Check if recipe exists
    const recipe = await prisma.cogsRecipe.findUnique({
      where: { id: recipeId },
      include: { product: true }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if recipe is already linked to a product
    if (recipe.product) {
      return NextResponse.json({ 
        error: 'This recipe is already published as a product',
        existingProduct: recipe.product
      }, { status: 400 });
    }

    // Convert price to cents (if provided in dollars)
    const priceInCents = price 
      ? Math.round(price * 100) 
      : Math.round(recipe.retailPrice * 100);

    // Create the product linked to the recipe
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: priceInCents,
        imageUrl,
        category: category || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        cogsRecipeId: recipeId,
      },
      include: {
        cogsRecipe: true,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product from recipe:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

