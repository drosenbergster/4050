import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/server/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server/auth';

const isDev = process.env.NODE_ENV === 'development';

// Check if request is from localhost in dev mode (for dev admin page)
async function isDevAuthorized(): Promise<boolean> {
  if (!isDev) return false;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  return host.includes('localhost');
}

// GET single recipe with ingredients
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const recipe = await prisma.cogsRecipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}

// PATCH update recipe
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Delete existing ingredients if new ones provided
    if (data.ingredients) {
      await prisma.cogsRecipeIngredient.deleteMany({
        where: { recipeId: id }
      });
    }

    // Build update data object (only include fields that are provided)
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.containerType !== undefined) updateData.containerType = data.containerType;
    if (data.containerCost !== undefined) updateData.containerCost = data.containerCost;
    if (data.labelCost !== undefined) updateData.labelCost = data.labelCost;
    if (data.energyCost !== undefined) updateData.energyCost = data.energyCost;
    if (data.retailPrice !== undefined) updateData.retailPrice = data.retailPrice;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.ingredients) {
      updateData.ingredients = {
        create: data.ingredients.map((ing: { ingredientId: string; quantity: number }) => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity
        }))
      };
    }

    const recipe = await prisma.cogsRecipe.update({
      where: { id },
      data: updateData,
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            isAvailable: true,
            price: true
          }
        }
      }
    });

    // Auto-sync: If retailPrice changed and recipe has a linked product, update product price
    if (data.retailPrice !== undefined && recipe.product) {
      const newPriceInCents = Math.round(data.retailPrice * 100);
      if (recipe.product.price !== newPriceInCents) {
        await prisma.product.update({
          where: { id: recipe.product.id },
          data: { price: newPriceInCents }
        });
      }
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

// DELETE recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.cogsRecipe.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}
