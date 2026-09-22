import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { canCheckIn, getReservationCheckInError } from '@/lib/checkin';
import { prisma } from '@/lib/prisma';

const checkInSchema = z.object({ qrToken: z.string().trim().min(1).max(512) });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = checkInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid QR code is required.' }, { status: 400 });
  }

  const scanner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!scanner || !canCheckIn(scanner.role)) {
    return NextResponse.json({ error: 'You are not authorized to check in reservations.' }, { status: 403 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const pass = await tx.qRPass.findUnique({
        where: { qrToken: parsed.data.qrToken },
        select: {
          reservation: {
            select: {
              id: true,
              code: true,
              status: true,
              vehicleNumber: true,
              vehicleType: true,
              event: { select: { title: true, eventDate: true, status: true } },
              user: { select: { name: true } },
              parkingZone: { select: { name: true } },
              slot: { select: { slotTime: true } },
            },
          },
        },
      });

      if (!pass?.reservation) {
        return { ok: false as const, status: 404, error: 'QR pass was not found.' };
      }

      const reservation = pass.reservation;
      const validationError = getReservationCheckInError(reservation.status, reservation.event.status);
      if (validationError) {
        await tx.checkInLog.create({
          data: { reservationId: reservation.id, scannedBy: scanner.id, status: validationError.logStatus },
        });
        return { ok: false as const, status: validationError.status, error: validationError.message };
      }

      const checkedInAt = new Date();
      const updated = await tx.reservation.updateMany({
        where: { id: reservation.id, status: 'CONFIRMED' },
        data: { status: 'CHECKED_IN', checkedInAt, checkedInById: scanner.id },
      });

      if (updated.count !== 1) {
        await tx.checkInLog.create({
          data: { reservationId: reservation.id, scannedBy: scanner.id, status: 'DUPLICATE' },
        });
        return { ok: false as const, status: 409, error: 'Reservation has already been checked in.' };
      }

      await tx.checkInLog.create({
        data: { reservationId: reservation.id, scannedBy: scanner.id, status: 'SUCCESS' },
      });

      return {
        ok: true as const,
        data: {
          reservationCode: reservation.code,
          attendeeName: reservation.user.name,
          eventTitle: reservation.event.title,
          eventDate: reservation.event.eventDate,
          vehicleNumber: reservation.vehicleNumber,
          vehicleType: reservation.vehicleType,
          parkingZone: reservation.parkingZone?.name ?? null,
          arrivalSlot: reservation.slot?.slotTime ?? null,
          checkedInAt,
        },
      };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ message: 'Check-in successful.', data: result.data });
  } catch (error) {
    console.error('Check-in failed', error);
    return NextResponse.json({ error: 'Unable to complete check-in.' }, { status: 500 });
  }
}
