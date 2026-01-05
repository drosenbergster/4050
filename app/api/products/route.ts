import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeVariants = searchParams.get('includeVariants') === 'true';

    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
      include: includeVariants ? {
        variants: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { sizeOz: 'asc' }],
        },
      } : undefined,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Require authenticated admin session
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, isAvailable } = body;

    // Basic input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description || '',
        price,
        imageUrl: imageUrl || '',
        isAvailable: isAvailable ?? true,
        quantity: 0, // New products start with 0 stock
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

