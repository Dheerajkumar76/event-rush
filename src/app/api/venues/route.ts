import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const createVenueSchema = z.object({
  name: z.string().min(2, 'Venue name must be at least 2 characters'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export async function GET() {
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

  const venues = await prisma.venue.findMany({
    where: {
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
      _count: {
        select: {
          events: true,
          parkingZones: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(venues);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (session.user.role !== 'ORGANIZER') {
    return NextResponse.json(
      { error: 'Only organizers can create venues' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createVenueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid venue data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, address, city, state, pincode } = parsed.data;

    const venue = await prisma.venue.create({
      data: {
        name,
        address,
        city,
        state,
        pincode,
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
      },
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error('Create venue error:', error);

    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}