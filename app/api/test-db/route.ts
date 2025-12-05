import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

export async function GET() {
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
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



