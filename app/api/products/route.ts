import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Require authentication for product creation
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, imageUrl, category, isAvailable } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        category,
        isAvailable: isAvailable ?? true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Failed to create product'
      : error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

