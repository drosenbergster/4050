import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';
import { OrganizationStatus, NominationStatus } from '@prisma/client';

/**
 * PATCH /api/admin/nominations/[id]
 * Approve or reject a nomination (admin only)
 * 
 * Body for approval: { action: 'approve', category: 'FOOD' | 'GARDEN' | 'YOUTH' | 'COMMUNITY' }
 * Body for rejection: { action: 'reject', reviewNotes?: string }
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
    const { action, category, reviewNotes } = body;

    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Check if nomination exists and is pending
    const nomination = await prisma.nomination.findUnique({
      where: { id },
    });

    if (!nomination) {
      return NextResponse.json({ error: 'Nomination not found' }, { status: 404 });
    }

    if (nomination.status !== NominationStatus.PENDING) {
      return NextResponse.json(
        { error: 'This nomination has already been reviewed' },
        { status: 400 }
      );
    }

    const reviewerEmail = session.user?.email || 'unknown';

    if (action === 'approve') {
      // Require category for approval
      if (!category) {
        return NextResponse.json(
          { error: 'Category is required when approving a nomination' },
          { status: 400 }
        );
      }

      const validCategories = ['FOOD', 'GARDEN', 'YOUTH', 'COMMUNITY'];
      if (!validCategories.includes(category.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }

      // Create organization from nomination
      const organization = await prisma.organization.create({
        data: {
          name: nomination.organizationName,
          shortDescription: nomination.missionDescription.substring(0, 200), // Truncate for short desc
          description: nomination.missionDescription,
          category: category.toUpperCase(),
          website: nomination.website,
          status: OrganizationStatus.IN_POOL, // Add to pool, not active
          activeCycles: [],
        },
      });

      // Update nomination as approved
      const updatedNomination = await prisma.nomination.update({
        where: { id },
        data: {
          status: NominationStatus.APPROVED,
          reviewedBy: reviewerEmail,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || null,
          createdOrgId: organization.id,
        },
      });

      return NextResponse.json({
        nomination: updatedNomination,
        organization,
        message: `"${nomination.organizationName}" has been approved and added to the organization pool.`,
      });
    } else {
      // Reject
      const updatedNomination = await prisma.nomination.update({
        where: { id },
        data: {
          status: NominationStatus.REJECTED,
          reviewedBy: reviewerEmail,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || null,
        },
      });

      return NextResponse.json({
        nomination: updatedNomination,
        message: `Nomination for "${nomination.organizationName}" has been rejected.`,
      });
    }
  } catch (error) {
    console.error('Failed to review nomination:', error);
    return NextResponse.json({ error: 'Failed to review nomination' }, { status: 500 });
  }
}

