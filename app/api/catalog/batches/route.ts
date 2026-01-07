import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

/**
 * GET /api/catalog/batches
 * List production batches with optional filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const flavorId = searchParams.get('flavorId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const batches = await prisma.productBatch.findMany({
      where: flavorId ? { flavorId } : {},
      orderBy: { batchDate: 'desc' },
      take: limit,
      include: {
        flavor: {
          include: { category: true },
        },
        size: true,
      },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Failed to fetch batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

/**
 * POST /api/catalog/batches
 * Record a new production batch
 * Optionally updates inventory for the associated size
 */
export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { flavorId, sizeId, quantity, batchDate, notes, updateInventory = true } = body;

    if (!flavorId || !quantity) {
      return NextResponse.json(
        { error: 'Flavor ID and quantity are required' },
        { status: 400 }
      );
    }

    // Use a transaction to create batch and optionally update inventory
    const result = await prisma.$transaction(async (tx) => {
      // Create the batch record
      const batch = await tx.productBatch.create({
        data: {
          flavorId,
          sizeId: sizeId || null,
          quantity: parseInt(quantity, 10),
          batchDate: batchDate ? new Date(batchDate) : new Date(),
          notes: notes || null,
        },
        include: {
          flavor: { include: { category: true } },
          size: true,
        },
      });

      // If updateInventory is true and a specific size is provided, add to inventory
      if (updateInventory && sizeId) {
        await tx.productSize.update({
          where: { id: sizeId },
          data: {
            quantity: {
              increment: parseInt(quantity, 10),
            },
          },
        });
      }

      return batch;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create batch:', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}


