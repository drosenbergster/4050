import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

/**
 * GET /api/catalog/flavors/[id]/sizes
 * List all sizes for a flavor
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: flavorId } = await params;

    const sizes = await prisma.productSize.findMany({
      where: { flavorId },
      orderBy: { sizeOz: 'asc' },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
    return NextResponse.json({ error: 'Failed to fetch sizes' }, { status: 500 });
  }
}

/**
 * POST /api/catalog/flavors/[id]/sizes
 * Create a new size option for a flavor
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: flavorId } = await params;
    const body = await request.json();
    const { sizeOz, unitPrice, containerType = 'jar' } = body;

    if (!sizeOz || !unitPrice) {
      return NextResponse.json(
        { error: 'Size (oz) and price are required' },
        { status: 400 }
      );
    }

    // Generate consistent sizeKey and sizeLabel
    const sizeKey = `${sizeOz}oz`;
    const sizeLabel = `${sizeOz} oz ${containerType}`;

    const size = await prisma.productSize.create({
      data: {
        flavorId,
        sizeKey,
        sizeLabel,
        sizeOz: parseInt(sizeOz, 10),
        unitPrice: parseInt(unitPrice, 10),
        quantity: 0,
        isActive: true,
        sortOrder: parseInt(sizeOz, 10), // Sort by oz
      },
    });

    return NextResponse.json(size, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'This size already exists for this flavor' },
        { status: 400 }
      );
    }
    console.error('Failed to create size:', error);
    return NextResponse.json({ error: 'Failed to create size' }, { status: 500 });
  }
}

