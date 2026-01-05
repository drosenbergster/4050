import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

/**
 * GET /api/catalog/flavors/[id]
 * Get a single flavor with all details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const flavor = await prisma.productFlavor.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: {
          orderBy: { sizeOz: 'asc' },
        },
        batches: {
          orderBy: { batchDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!flavor) {
      return NextResponse.json({ error: 'Flavor not found' }, { status: 404 });
    }

    const totalQuantity = flavor.sizes.reduce((sum, size) => sum + size.quantity, 0);
    const prices = flavor.sizes.map((s) => s.unitPrice);

    return NextResponse.json({
      ...flavor,
      fullName: `${flavor.name} ${flavor.category.name}`.trim(),
      totalQuantity,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    });
  } catch (error) {
    console.error('Failed to fetch flavor:', error);
    return NextResponse.json({ error: 'Failed to fetch flavor' }, { status: 500 });
  }
}

/**
 * PUT /api/catalog/flavors/[id]
 * Update a flavor
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
    const { name, description, imageUrl, isAvailable, sortOrder, categoryId } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const flavor = await prisma.productFlavor.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({
      ...flavor,
      fullName: `${flavor.name} ${flavor.category.name}`.trim(),
    });
  } catch (error) {
    console.error('Failed to update flavor:', error);
    return NextResponse.json({ error: 'Failed to update flavor' }, { status: 500 });
  }
}

/**
 * DELETE /api/catalog/flavors/[id]
 * Delete a flavor and all its sizes
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

    await prisma.productFlavor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete flavor:', error);
    return NextResponse.json({ error: 'Failed to delete flavor' }, { status: 500 });
  }
}

