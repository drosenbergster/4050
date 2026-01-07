import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';
import { OrganizationStatus } from '@prisma/client';

/**
 * GET /api/admin/organizations/[id]
 * Returns a single organization by ID (admin only)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/organizations/[id]
 * Updates an organization's status or details (admin only)
 * Primary use: toggling ACTIVE <-> IN_POOL status
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

    // Check if organization exists
    const existing = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Build update data - only include provided fields
    const updateData: Record<string, unknown> = {};
    
    if (body.status !== undefined) {
      // Validate status
      const validStatuses = Object.values(OrganizationStatus);
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
      
      // If activating, add current cycle to activeCycles
      if (body.status === OrganizationStatus.ACTIVE) {
        const currentCycle = getCurrentCycle();
        if (!existing.activeCycles.includes(currentCycle)) {
          updateData.activeCycles = [...existing.activeCycles, currentCycle];
        }
      }
    }

    // Allow updating other fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category.toUpperCase();
    if (body.website !== undefined) updateData.website = body.website;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.contactPerson !== undefined) updateData.contactPerson = body.contactPerson;
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail;

    const organization = await prisma.organization.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to update organization:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}

/**
 * Helper to determine current cycle name
 * Cycles are: "Spring YYYY" (May) and "Fall YYYY" (November)
 */
function getCurrentCycle(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();
  
  // November (10) through April (3) = Fall cycle of current/previous year
  // May (4) through October (9) = Spring cycle of current year
  if (month >= 4 && month <= 9) {
    return `Spring ${year}`;
  } else if (month >= 10) {
    return `Fall ${year}`;
  } else {
    // Jan-April: still in previous fall cycle
    return `Fall ${year - 1}`;
  }
}


