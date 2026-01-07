import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/server/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server/auth';

const isDev = process.env.NODE_ENV === 'development';

async function isDevAuthorized(): Promise<boolean> {
  if (!isDev) return false;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  return host.includes('localhost');
}

// GET all layouts
export async function GET() {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const layouts = await prisma.gardenLayout.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(layouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    return NextResponse.json({ error: 'Failed to fetch layouts' }, { status: 500 });
  }
}

// POST create new layout
export async function POST(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const layout = await prisma.gardenLayout.create({
      data: {
        name: data.name || 'Untitled Layout',
        canvasData: data.canvasData || { beds: [], plants: [] },
      }
    });

    return NextResponse.json(layout, { status: 201 });
  } catch (error) {
    console.error('Error creating layout:', error);
    return NextResponse.json({ error: 'Failed to create layout' }, { status: 500 });
  }
}



