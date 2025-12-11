import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

export async function GET() {
  // Security: Only allow in development OR require authentication in production
  if (process.env.NODE_ENV === 'production') {
    // In production, require authentication
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  // In development, allow without auth (for testing)
  
  try {
    // Test database connection by counting users
    const userCount = await prisma.user.count();
    
    // Get database info
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const dbVersion = result[0]?.version || 'Unknown';
    
    return NextResponse.json({
      status: 'connected',
      message: 'Database connection successful',
      userCount,
      database: dbVersion.split(' ')[0], // Just get PostgreSQL version
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Database connection failed'
      : error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        ...(process.env.NODE_ENV !== 'production' && { error: errorMessage }),
      },
      { status: 500 }
    );
  }
}




