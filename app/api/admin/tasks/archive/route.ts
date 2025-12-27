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

// POST - Create new year's tasks by copying template from another year
export async function POST(request: NextRequest) {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const targetYear = data.targetYear || new Date().getFullYear();
    const sourceYear = data.sourceYear || targetYear - 1;

    // Check if target year already has tasks
    const existingTasks = await prisma.seasonalTask.count({
      where: { year: targetYear }
    });

    if (existingTasks > 0) {
      return NextResponse.json({ 
        error: `Tasks already exist for ${targetYear}. Delete them first if you want to reset.`,
        existingCount: existingTasks 
      }, { status: 400 });
    }

    // Get source year tasks as template
    const sourceTasks = await prisma.seasonalTask.findMany({
      where: { year: sourceYear },
      orderBy: [{ month: 'asc' }, { sortOrder: 'asc' }]
    });

    if (sourceTasks.length === 0) {
      return NextResponse.json({ 
        error: `No tasks found for source year ${sourceYear}` 
      }, { status: 404 });
    }

    // Create new tasks for target year (uncompleted)
    const newTasks = await prisma.seasonalTask.createMany({
      data: sourceTasks.map(task => ({
        title: task.title,
        month: task.month,
        weekOfMonth: task.weekOfMonth,
        isCompleted: false,
        completedAt: null,
        year: targetYear,
        notes: task.notes,
        sortOrder: task.sortOrder,
      }))
    });

    return NextResponse.json({ 
      success: true, 
      message: `Created ${newTasks.count} tasks for ${targetYear}`,
      count: newTasks.count
    });
  } catch (error) {
    console.error('Error creating new year tasks:', error);
    return NextResponse.json({ error: 'Failed to create new year tasks' }, { status: 500 });
  }
}

// GET - Get list of years that have task data
export async function GET() {
  try {
    const devAuth = await isDevAuthorized();
    const session = await getServerSession(authOptions);
    if (!session && !devAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const years = await prisma.seasonalTask.groupBy({
      by: ['year'],
      _count: { id: true },
      orderBy: { year: 'desc' }
    });

    const yearsWithStats = await Promise.all(
      years.map(async (y) => {
        const completed = await prisma.seasonalTask.count({
          where: { year: y.year, isCompleted: true }
        });
        return {
          year: y.year,
          totalTasks: y._count.id,
          completedTasks: completed,
          completionRate: Math.round((completed / y._count.id) * 100)
        };
      })
    );

    return NextResponse.json(yearsWithStats);
  } catch (error) {
    console.error('Error fetching task years:', error);
    return NextResponse.json({ error: 'Failed to fetch task years' }, { status: 500 });
  }
}

