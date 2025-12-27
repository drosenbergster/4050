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

    const crop = await prisma.crop.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        seedStartWeek: data.seedStartWeek,
        seedStartNotes: data.seedStartNotes,
        plantOutWeekStart: data.plantOutWeekStart,
        plantOutWeekEnd: data.plantOutWeekEnd,
        directSow: data.directSow,
        harvestStart: data.harvestStart,
        harvestEnd: data.harvestEnd,
        peakStart: data.peakStart,
        peakEnd: data.peakEnd,
        color: data.color,
        notes: data.notes,
        ingredientId: data.ingredientId,
      },
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

