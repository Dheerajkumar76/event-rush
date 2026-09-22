import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/auth';

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  eventDate: z.string(),
  venueId: z.string().min(1),
});

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        status: true,
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
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
        eventParkingZones: {
          select: {
            zone: {
              select: {
                id: true,
                name: true,
                type: true,
                capacity: true,
              },
            },
          },
        },
        arrivalSlots: {
          select: {
            id: true,
            slotTime: true,
            maxEntries: true,
          },
          orderBy: {
            slotTime: 'asc',
          },
        },
      },
      orderBy: {
        eventDate: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);

    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json(
        { error: 'Only organizers can create events.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid event data',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      eventDate,
      venueId,
    } = parsed.data;

    // Make sure the venue belongs to the authenticated organizer.
    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        organizerId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'You can only use venues that belong to you.' },
        { status: 403 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        organizerId: session.user.id,
        venueId,
        status: 'DRAFT',
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        status: true,
        organizerId: true,
        venueId: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);

    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}