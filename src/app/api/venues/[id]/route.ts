import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const updateVenueSchema = z.object({
  name: z.string().min(2, 'Venue name must be at least 2 characters'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  pincode: z.string().optional(),
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
      { error: 'Only organizers can access venues' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const venue = await prisma.venue.findFirst({
    where: {
      id,
      organizerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          events: true,
          parkingZones: true,
        },
      },
    },
  });

  if (!venue) {
    return NextResponse.json(
      { error: 'Venue not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(venue);
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
      { error: 'Only organizers can update venues' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateVenueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid venue data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingVenue = await prisma.venue.findFirst({
      where: {
        id,
        organizerId: session.user.id,
      },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    const venue = await prisma.venue.update({
      where: {
        id,
      },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(venue);
  } catch (error) {
    console.error('Update venue error:', error);

    return NextResponse.json(
      { error: 'Failed to update venue' },
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
      { error: 'Only organizers can delete venues' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const venue = await prisma.venue.findFirst({
      where: {
        id,
        organizerId: session.user.id,
      },
      select: {
        id: true,
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    if (venue._count.events > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete a venue that has events. Remove or move the events first.',
        },
        { status: 409 }
      );
    }

    await prisma.venue.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'Venue deleted successfully',
    });
  } catch (error) {
    console.error('Delete venue error:', error);

    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    );
  }
}