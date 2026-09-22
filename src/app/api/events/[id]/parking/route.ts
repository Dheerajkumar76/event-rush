import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const parkingSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['VIP', 'GENERAL', 'STAFF', 'DISABLED']),
  capacity: z.number().int().positive(),
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

  const mappings = await prisma.eventParkingZone.findMany({
    where: {
      eventId: id,
    },
    select: {
      id: true,
      zone: {
        select: {
          id: true,
          name: true,
          type: true,
          capacity: true,
        },
      },
    },
    orderBy: {
      zone: {
        name: 'asc',
      },
    },
  });

  return NextResponse.json(mappings);
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
      venueId: true,
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

    const parsed = parkingSchema.safeParse({
      ...body,
      capacity: Number(body.capacity),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parking zone data' },
        { status: 400 }
      );
    }

    const zone = await prisma.parkingZone.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        capacity: parsed.data.capacity,
        venueId: event.venueId,
      },
    });

    const mapping = await prisma.eventParkingZone.create({
      data: {
        eventId: id,
        zoneId: zone.id,
      },
      select: {
        id: true,
        zone: {
          select: {
            id: true,
            name: true,
            type: true,
            capacity: true,
          },
        },
      },
    });

    return NextResponse.json(mapping, {
      status: 201,
    });
  } catch (error) {
    console.error('Create parking zone error:', error);

    return NextResponse.json(
      { error: 'Failed to create parking zone' },
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

  const body = await request.json();

  if (!body.zoneId) {
    return NextResponse.json(
      { error: 'zoneId is required' },
      { status: 400 }
    );
  }

  const mapping = await prisma.eventParkingZone.findFirst({
    where: {
      eventId: id,
      zoneId: body.zoneId,
    },
  });

  if (!mapping) {
    return NextResponse.json(
      { error: 'Parking zone not mapped to this event' },
      { status: 404 }
    );
  }

  const reservationCount = await prisma.reservation.count({
    where: {
      eventId: id,
      parkingZoneId: body.zoneId,
    },
  });

  if (reservationCount > 0) {
    return NextResponse.json(
      {
        error:
          'Cannot remove a parking zone with existing reservations.',
      },
      { status: 409 }
    );
  }

  await prisma.eventParkingZone.delete({
    where: {
      id: mapping.id,
    },
  });

  return NextResponse.json({
    message: 'Parking zone removed from event',
  });
}