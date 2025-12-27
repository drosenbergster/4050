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

// GET all ingredients
export async function GET() {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ingredients = await prisma.ingredient.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
  }
}

// POST create new ingredient
export async function POST(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        unitCost: data.unitCost,
        unit: data.unit,
        isFromGarden: data.isFromGarden || false,
        category: data.category || 'Other',
        notes: data.notes || null,
      }
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 500 });
  }
}

