import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const updateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  eventDate: z.string(),
  venueId: z.string().min(1, 'Venue is required'),
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
      { error: 'Only organizers can access events' },
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
      title: true,
      description: true,
      eventDate: true,
      status: true,
      venueId: true,
      venue: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
        },
      },
      _count: {
        select: {
          reservations: true,
          arrivalSlots: true,
          eventParkingZones: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}

export async function PATCH(
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
      { error: 'Only organizers can update events' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();

    const parsed = updateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid event data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        organizerId: session.user.id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const venue = await prisma.venue.findFirst({
      where: {
        id: parsed.data.venueId,
        organizerId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        {
          error: 'Selected venue does not belong to you',
        },
        { status: 403 }
      );
    }

    const eventDate = new Date(parsed.data.eventDate);

    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid event date' },
        { status: 400 }
      );
    }

    const event = await prisma.event.update({
      where: {
        id,
      },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        eventDate,
        venueId: parsed.data.venueId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        status: true,
        venueId: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Update event error:', error);

    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      { error: 'Only organizers can delete events' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const event = await prisma.event.findFirst({
      where: {
        id,
        organizerId: session.user.id,
      },
      select: {
        id: true,
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event._count.reservations > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete an event that already has reservations.',
        },
        { status: 409 }
      );
    }

    await prisma.event.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);

    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

export async function POST(
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
      { error: 'Only organizers can cancel events' },
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
      { error: 'Event is already cancelled' },
      { status: 409 }
    );
  }

  const updatedEvent = await prisma.event.update({
    where: {
      id: event.id,
    },
    data: {
      status: 'CANCELLED',
    },
    select: {
      id: true,
      status: true,
    },
  });

  return NextResponse.json({
    message: 'Event cancelled successfully',
    event: updatedEvent,
  });
}