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

// GET single ingredient
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

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json({ error: 'Failed to fetch ingredient' }, { status: 500 });
  }
}

// PATCH update ingredient
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

    // Build update data, only including provided fields
    const updateData: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.unitCost !== undefined) updateData.unitCost = data.unitCost;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    // Purchase tracking fields
    if (data.purchaseSize !== undefined) updateData.purchaseSize = data.purchaseSize;
    if (data.purchaseUnit !== undefined) updateData.purchaseUnit = data.purchaseUnit;
    if (data.purchaseCost !== undefined) updateData.purchaseCost = data.purchaseCost;

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ error: 'Failed to update ingredient' }, { status: 500 });
  }
}

// DELETE ingredient
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

    await prisma.ingredient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ error: 'Failed to delete ingredient' }, { status: 500 });
  }
}
