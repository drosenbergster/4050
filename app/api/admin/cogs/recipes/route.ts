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

// GET all recipes with ingredients
// Query params: ?status=IDEA|READY|PUBLISHED (optional filter)
export async function GET(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse optional status filter
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    
    const whereClause = statusFilter 
      ? { status: statusFilter as 'IDEA' | 'READY' | 'PUBLISHED' }
      : {};

    const recipes = await prisma.cogsRecipe.findMany({
      where: whereClause,
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
            description: true,
            imageUrl: true,
            category: true,
            isAvailable: true,
            price: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

// POST create new recipe
export async function POST(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const recipe = await prisma.cogsRecipe.create({
      data: {
        name: data.name,
        description: data.description || null,
        containerType: data.containerType,
        containerCost: data.containerCost || 0,
        labelCost: data.labelCost || 0.20,
        energyCost: data.energyCost || 0.30,
        retailPrice: data.retailPrice,
        notes: data.notes || null,
        status: data.status || 'IDEA', // Default to IDEA for new recipes
        ingredients: {
          create: data.ingredients?.map((ing: { ingredientId: string; quantity: number }) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity
          })) || []
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        },
        product: true
      }
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}

