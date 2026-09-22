import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const event = await prisma.event.findFirst({
      where: {
        id,
        organizerId: session.user.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cancelled events cannot be published' },
        { status: 400 }
      );
    }

    const newStatus =
      event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    const updatedEvent = await prisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        status: newStatus,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Publish toggle error:', error);

    return NextResponse.json(
      { error: 'Failed to update event status' },
      { status: 500 }
    );
  }
}