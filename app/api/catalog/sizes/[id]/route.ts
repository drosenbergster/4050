import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

/**
 * PUT /api/catalog/sizes/[id]
 * Update a size (price, label, active status)
 */
export async function PUT(
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
    const { unitPrice, sizeLabel, isActive, sortOrder, quantity } = body;

    const updateData: Record<string, unknown> = {};
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if (sizeLabel !== undefined) updateData.sizeLabel = sizeLabel;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (quantity !== undefined) updateData.quantity = Math.max(0, quantity);

    const size = await prisma.productSize.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(size);
  } catch (error) {
    console.error('Failed to update size:', error);
    return NextResponse.json({ error: 'Failed to update size' }, { status: 500 });
  }
}

/**
 * DELETE /api/catalog/sizes/[id]
 * Delete a size option
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.productSize.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete size:', error);
    return NextResponse.json({ error: 'Failed to delete size' }, { status: 500 });
  }
}

