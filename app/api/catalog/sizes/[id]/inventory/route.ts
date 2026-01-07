import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

/**
 * PATCH /api/catalog/sizes/[id]/inventory
 * Adjust inventory for a size (add or subtract)
 * Body: { adjustment: number } - positive to add, negative to subtract
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { adjustment } = body;

    if (typeof adjustment !== 'number' || !Number.isInteger(adjustment)) {
      return NextResponse.json(
        { error: 'Adjustment must be an integer' },
        { status: 400 }
      );
    }

    // Get current size
    const currentSize = await prisma.productSize.findUnique({
      where: { id },
      select: { quantity: true, sizeLabel: true, flavorId: true },
    });

    if (!currentSize) {
      return NextResponse.json({ error: 'Size not found' }, { status: 404 });
    }

    // Calculate new quantity (floor at 0)
    const newQuantity = Math.max(0, currentSize.quantity + adjustment);

    // Update the size
    const size = await prisma.productSize.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    return NextResponse.json({
      id: size.id,
      sizeLabel: size.sizeLabel,
      quantity: size.quantity,
      previousQuantity: currentSize.quantity,
      adjustment,
    });
  } catch (error) {
    console.error('Failed to adjust inventory:', error);
    return NextResponse.json({ error: 'Failed to adjust inventory' }, { status: 500 });
  }
}


