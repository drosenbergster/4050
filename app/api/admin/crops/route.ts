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

// GET all crops with optional ingredient relations
export async function GET() {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const crops = await prisma.crop.findMany({
      include: {
        ingredient: true,
      },
      orderBy: [
        { harvestStart: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    return NextResponse.json({ error: 'Failed to fetch crops' }, { status: 500 });
  }
}

// POST create new crop
export async function POST(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const crop = await prisma.crop.create({
      data: {
        name: data.name,
        type: data.type || 'ANNUAL',
        seedStartWeek: data.seedStartWeek || null,
        seedStartNotes: data.seedStartNotes || null,
        plantOutWeekStart: data.plantOutWeekStart || null,
        plantOutWeekEnd: data.plantOutWeekEnd || null,
        directSow: data.directSow || false,
        harvestStart: data.harvestStart,
        harvestEnd: data.harvestEnd,
        peakStart: data.peakStart || null,
        peakEnd: data.peakEnd || null,
        color: data.color || '#4A7C59',
        notes: data.notes || null,
        ingredientId: data.ingredientId || null,
      },
      include: {
        ingredient: true,
      }
    });

    return NextResponse.json(crop, { status: 201 });
  } catch (error) {
    console.error('Error creating crop:', error);
    return NextResponse.json({ error: 'Failed to create crop' }, { status: 500 });
  }
}

