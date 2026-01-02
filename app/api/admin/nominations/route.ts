import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

/**
 * GET /api/admin/nominations
 * Returns all nominations (admin only)
 * Optional query param: ?status=PENDING to filter
 */
export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const nominations = await prisma.nomination.findMany({
      where: statusFilter ? {
        status: statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED',
      } : undefined,
      orderBy: [
        { status: 'asc' }, // PENDING first (alphabetically)
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(nominations);
  } catch (error) {
    console.error('Failed to fetch nominations:', error);
    return NextResponse.json({ error: 'Failed to fetch nominations' }, { status: 500 });
  }
}

