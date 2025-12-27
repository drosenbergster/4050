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

    const recipe = await prisma.cogsRecipe.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        containerType: data.containerType,
        containerCost: data.containerCost,
        labelCost: data.labelCost,
        energyCost: data.energyCost,
        retailPrice: data.retailPrice,
        notes: data.notes,
        ingredients: data.ingredients ? {
          create: data.ingredients.map((ing: { ingredientId: string; quantity: number }) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity
          }))
        } : undefined
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

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
