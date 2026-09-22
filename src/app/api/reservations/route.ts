import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const createReservationSchema = z.object({
  eventId: z.string().min(1),
  parkingZoneId: z.string().optional(),
  slotId: z.string().optional(),
  vehicleNumber: z.string().min(3),
  vehicleType: z.enum(['CAR', 'BIKE', 'SUV', 'VAN', 'BUS']),
});

function generateCode() {
  return `ER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function generateQrToken() {
  return `QR-${crypto.randomUUID()}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;

    if (!['ATTENDEE', 'ORGANIZER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'You are not authorized to list reservations' },
        { status: 403 }
      );
    }

    const where =
      role === 'ATTENDEE'
        ? { userId: session.user.id }
        : role === 'ORGANIZER'
          ? { event: { organizerId: session.user.id } }
          : undefined;

    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        id: true,
        code: true,
        vehicleNumber: true,
        vehicleType: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
          },
        },
        parkingZone: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        slot: {
          select: {
            id: true,
            slotTime: true,
            maxEntries: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid reservation data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUserId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: data.eventId },
        select: {
          id: true,
          status: true,
          eventDate: true,
        },
      });

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      if (event.status !== 'PUBLISHED') {
        throw new Error('EVENT_NOT_BOOKABLE');
      }

      const user = await tx.user.findUnique({
        where: { id: sessionUserId },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.role !== 'ATTENDEE') {
        throw new Error('ONLY_ATTENDEE_CAN_BOOK');
      }

      const existingReservation = await tx.reservation.findFirst({
        where: {
          userId: sessionUserId,
          eventId: data.eventId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
          },
        },
        select: { id: true, code: true },
      });

      if (existingReservation) {
        throw new Error('DUPLICATE_EVENT_BOOKING');
      }

      if (data.slotId) {
        const slot = await tx.arrivalSlot.findUnique({
          where: { id: data.slotId },
          select: {
            id: true,
            eventId: true,
            maxEntries: true,
          },
        });

        if (!slot) {
          throw new Error('SLOT_NOT_FOUND');
        }

        if (slot.eventId !== data.eventId) {
          throw new Error('SLOT_EVENT_MISMATCH');
        }

        const slotReservationCount = await tx.reservation.count({
          where: {
            slotId: data.slotId,
            status: {
              in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
            },
          },
        });

        if (slotReservationCount >= slot.maxEntries) {
          throw new Error('SLOT_FULL');
        }
      }

      if (data.parkingZoneId) {
        const zone = await tx.parkingZone.findUnique({
          where: { id: data.parkingZoneId },
          select: {
            id: true,
            capacity: true,
          },
        });

        if (!zone) {
          throw new Error('ZONE_NOT_FOUND');
        }

        const eventZoneMapping = await tx.eventParkingZone.findFirst({
          where: {
            eventId: data.eventId,
            zoneId: data.parkingZoneId,
          },
          select: { id: true },
        });

        if (!eventZoneMapping) {
          throw new Error('ZONE_EVENT_MISMATCH');
        }

        const zoneReservationCount = await tx.reservation.count({
          where: {
            parkingZoneId: data.parkingZoneId,
            status: {
              in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
            },
          },
        });

        if (zoneReservationCount >= zone.capacity) {
          throw new Error('ZONE_FULL');
        }
      }

      const reservation = await tx.reservation.create({
        data: {
          code: generateCode(),
          vehicleNumber: data.vehicleNumber.trim().toUpperCase(),
          vehicleType: data.vehicleType,
          status: 'CONFIRMED',
          user: {
            connect: {
              id: sessionUserId,
            },
          },
          event: {
            connect: {
              id: data.eventId,
            },
          },
          ...(data.parkingZoneId
            ? {
                parkingZone: {
                  connect: {
                    id: data.parkingZoneId,
                  },
                },
              }
            : {}),
          ...(data.slotId
            ? {
                slot: {
                  connect: {
                    id: data.slotId,
                  },
                },
              }
            : {}),
          qrPass: {
            create: {
              qrToken: generateQrToken(),
            },
          },
        },
        select: {
          id: true,
          code: true,
          vehicleNumber: true,
          vehicleType: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
            },
          },
          parkingZone: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          slot: {
            select: {
              id: true,
              slotTime: true,
              maxEntries: true,
            },
          },
          qrPass: {
  select: {
    id: true,
    issuedAt: true,
  },
},
        },
      });

      return reservation;
    });

    return NextResponse.json(
      {
        message: 'Reservation created successfully',
        reservation: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reservation:', error);

    if (error instanceof Error) {
      const errorMap: Record<string, { message: string; status: number }> = {
        EVENT_NOT_FOUND: { message: 'Event not found', status: 404 },
        EVENT_NOT_BOOKABLE: { message: 'Event is not open for reservations', status: 400 },
        USER_NOT_FOUND: { message: 'User not found', status: 404 },
        ONLY_ATTENDEE_CAN_BOOK: { message: 'Only attendees can create reservations', status: 403 },
        DUPLICATE_EVENT_BOOKING: { message: 'User already has a reservation for this event', status: 409 },
        SLOT_NOT_FOUND: { message: 'Arrival slot not found', status: 404 },
        SLOT_EVENT_MISMATCH: { message: 'Selected slot does not belong to this event', status: 400 },
        SLOT_FULL: { message: 'Selected arrival slot is full', status: 409 },
        ZONE_NOT_FOUND: { message: 'Parking zone not found', status: 404 },
        ZONE_EVENT_MISMATCH: { message: 'Selected parking zone is not available for this event', status: 400 },
        ZONE_FULL: { message: 'Selected parking zone is full', status: 409 },
      };

      const mapped = errorMap[error.message];
      if (mapped) {
        return NextResponse.json({ error: mapped.message }, { status: mapped.status });
      }
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
