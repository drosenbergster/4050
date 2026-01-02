import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { OrganizationStatus } from '@prisma/client';

/**
 * GET /api/organizations/active
 * Returns all ACTIVE organizations (public endpoint, no auth required)
 * Used by checkout, impact page, etc.
 * 
 * Response format matches the existing Organization interface from lib/causes.ts
 * for backward compatibility
 */
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        status: OrganizationStatus.ACTIVE,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        shortDescription: true,
        description: true,
        category: true,
        website: true,
        logoUrl: true,
        imageUrl: true,
      },
    });

    // Transform to match existing interface (lowercase category)
    const transformed = organizations.map(org => ({
      ...org,
      category: org.category.toLowerCase() as 'food' | 'garden' | 'youth' | 'community',
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Failed to fetch active organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

