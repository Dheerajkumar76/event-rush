import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

  if (session.user.role !== 'ATTENDEE') {
    return NextResponse.json(
      { error: 'Only attendees can cancel reservations' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: 'Reservation not found' },
      { status: 404 }
    );
  }

  if (reservation.status === 'CANCELLED') {
    return NextResponse.json(
      { error: 'Reservation is already cancelled' },
      { status: 409 }
    );
  }

  if (reservation.status === 'CHECKED_IN') {
    return NextResponse.json(
      { error: 'Checked-in reservations cannot be cancelled' },
      { status: 409 }
    );
  }

  const updatedReservation = await prisma.reservation.update({
    where: {
      id: reservation.id,
    },
    data: {
      status: 'CANCELLED',
    },
    select: {
      id: true,
      code: true,
      status: true,
    },
  });

  return NextResponse.json({
    message: 'Reservation cancelled successfully',
    reservation: updatedReservation,
  });
}