import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

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
    const { fulfillmentStatus } = body;

    if (!fulfillmentStatus || !['PENDING', 'FULFILLED'].includes(fulfillmentStatus)) {
      return NextResponse.json({ error: 'Invalid fulfillment status' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { fulfillmentStatus },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

