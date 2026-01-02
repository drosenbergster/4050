import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

/**
 * POST /api/organizations/nominate
 * Accepts a nomination from a community member (public endpoint, no auth required)
 * Creates a nomination record with PENDING status for admin review
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      organizationName, 
      website, 
      missionDescription, 
      reason,
      nominatorName,
      nominatorEmail,
    } = body;

    // Validate required fields
    if (!organizationName || !missionDescription || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationName, missionDescription, reason' },
        { status: 400 }
      );
    }

    // Validate website URL format if provided
    if (website) {
      try {
        new URL(website);
      } catch {
        return NextResponse.json(
          { error: 'Invalid website URL format' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate nominations (same org name within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const existingNomination = await prisma.nomination.findFirst({
      where: {
        organizationName: {
          equals: organizationName,
          mode: 'insensitive', // Case-insensitive match
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: 'PENDING',
      },
    });

    if (existingNomination) {
      return NextResponse.json(
        { error: 'This organization has already been nominated recently. Thank you for your support!' },
        { status: 409 } // Conflict
      );
    }

    // Create the nomination
    const nomination = await prisma.nomination.create({
      data: {
        organizationName,
        website: website || null,
        missionDescription,
        reason,
        nominatorName: nominatorName || null,
        nominatorEmail: nominatorEmail || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: 'Thank you for your nomination! We will review it soon.',
      id: nomination.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create nomination:', error);
    return NextResponse.json({ error: 'Failed to submit nomination' }, { status: 500 });
  }
}

