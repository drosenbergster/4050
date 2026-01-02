import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';
import { OrganizationStatus } from '@prisma/client';

/**
 * GET /api/admin/organizations
 * Returns all organizations with their status (admin only)
 */
export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const organizations = await prisma.organization.findMany({
      orderBy: [
        { status: 'asc' }, // ACTIVE first
        { name: 'asc' },
      ],
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

/**
 * POST /api/admin/organizations
 * Creates a new organization (admin only)
 * Used when approving nominations
 */
export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { 
      name, 
      shortDescription, 
      description, 
      category, 
      website, 
      imageUrl,
      contactPerson,
      contactEmail,
      status = OrganizationStatus.IN_POOL, // Default to pool, not active
    } = body;

    // Validate required fields
    if (!name || !shortDescription || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, shortDescription, description, category' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['FOOD', 'GARDEN', 'YOUTH', 'COMMUNITY'];
    if (!validCategories.includes(category.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        shortDescription,
        description,
        category: category.toUpperCase(),
        website: website || null,
        imageUrl: imageUrl || null,
        contactPerson: contactPerson || null,
        contactEmail: contactEmail || null,
        status,
        activeCycles: [],
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}

