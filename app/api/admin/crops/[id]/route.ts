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

// GET single crop with full details including related recipes
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

    const crop = await prisma.crop.findUnique({
      where: { id },
      include: {
        ingredient: {
          include: {
            recipeIngredients: {
              include: {
                recipe: {
                  include: {
                    product: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!crop) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    return NextResponse.json(crop);
  } catch (error) {
    console.error('Error fetching crop:', error);
    return NextResponse.json({ error: 'Failed to fetch crop' }, { status: 500 });
  }
}

// PATCH update crop
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

    // Build update data - only include fields that were provided
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.seedStartWeek !== undefined) updateData.seedStartWeek = data.seedStartWeek;
    if (data.seedStartNotes !== undefined) updateData.seedStartNotes = data.seedStartNotes;
    if (data.plantOutWeekStart !== undefined) updateData.plantOutWeekStart = data.plantOutWeekStart;
    if (data.plantOutWeekEnd !== undefined) updateData.plantOutWeekEnd = data.plantOutWeekEnd;
    if (data.directSow !== undefined) updateData.directSow = data.directSow;
    if (data.harvestStart !== undefined) updateData.harvestStart = data.harvestStart;
    if (data.harvestEnd !== undefined) updateData.harvestEnd = data.harvestEnd;
    if (data.peakStart !== undefined) updateData.peakStart = data.peakStart;
    if (data.peakEnd !== undefined) updateData.peakEnd = data.peakEnd;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.ingredientId !== undefined) updateData.ingredientId = data.ingredientId;
    // Yield tracking fields
    if (data.plantCount !== undefined) updateData.plantCount = data.plantCount;
    if (data.yieldPerUnit !== undefined) updateData.yieldPerUnit = data.yieldPerUnit;
    if (data.yieldUnit !== undefined) updateData.yieldUnit = data.yieldUnit;
    if (data.lastYearYield !== undefined) updateData.lastYearYield = data.lastYearYield;

    const crop = await prisma.crop.update({
      where: { id },
      data: updateData,
      include: {
        ingredient: true,
      }
    });

    return NextResponse.json(crop);
  } catch (error) {
    console.error('Error updating crop:', error);
    return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 });
  }
}

// DELETE crop
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

    await prisma.crop.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting crop:', error);
    return NextResponse.json({ error: 'Failed to delete crop' }, { status: 500 });
  }
}


