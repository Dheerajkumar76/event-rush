import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const slotSchema = z.object({
  slotTime: z.string().min(1),
  maxEntries: z.number().int().positive(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
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

  const { id } = await context.params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      organizerId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  const slots = await prisma.arrivalSlot.findMany({
    where: {
      eventId: id,
    },
    select: {
      id: true,
      slotTime: true,
      maxEntries: true,
      _count: {
        select: {
          reservations: true,
        },
      },
    },
    orderBy: {
      slotTime: 'asc',
    },
  });

  return NextResponse.json(slots);
}

export async function POST(
  request: Request,
  context: RouteContext
) {
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

  const { id } = await context.params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      organizerId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    const parsed = slotSchema.safeParse({
      ...body,
      maxEntries: Number(body.maxEntries),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid arrival slot data' },
        { status: 400 }
      );
    }

    const slotTime = new Date(parsed.data.slotTime);

    if (Number.isNaN(slotTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid slot time' },
        { status: 400 }
      );
    }

    const slot = await prisma.arrivalSlot.create({
      data: {
        eventId: id,
        slotTime,
        maxEntries: parsed.data.maxEntries,
      },
      select: {
        id: true,
        slotTime: true,
        maxEntries: true,
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });

    return NextResponse.json(slot, {
      status: 201,
    });
  } catch (error) {
    console.error('Create arrival slot error:', error);

    return NextResponse.json(
      { error: 'Failed to create arrival slot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
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

  const { id } = await context.params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      organizerId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    if (!body.slotId) {
      return NextResponse.json(
        { error: 'slotId is required' },
        { status: 400 }
      );
    }

    const slot = await prisma.arrivalSlot.findFirst({
      where: {
        id: body.slotId,
        eventId: id,
      },
      select: {
        id: true,
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Arrival slot not found' },
        { status: 404 }
      );
    }

    const reservationCount =
      await prisma.reservation.count({
        where: {
          eventId: id,
          slotId: body.slotId,
        },
      });

    if (reservationCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete an arrival slot with existing reservations.',
        },
        { status: 409 }
      );
    }

    await prisma.arrivalSlot.delete({
      where: {
        id: slot.id,
      },
    });

    return NextResponse.json({
      message: 'Arrival slot deleted successfully',
    });
  } catch (error) {
    console.error('Delete arrival slot error:', error);

    return NextResponse.json(
      { error: 'Failed to delete arrival slot' },
      { status: 500 }
    );
  }
}