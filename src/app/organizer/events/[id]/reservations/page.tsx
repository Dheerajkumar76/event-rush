import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventReservationsPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ORGANIZER') {
    redirect('/');
  }

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      organizerId: session.user.id,
    },
    select: {
      id: true,
      title: true,
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
    },
  });

  if (!event) {
    notFound();
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      eventId: event.id,
    },
    select: {
      id: true,
      code: true,
      vehicleNumber: true,
      vehicleType: true,
      status: true,
      createdAt: true,
      checkedInAt: true,

      user: {
        select: {
          name: true,
          email: true,
        },
      },

      parkingZone: {
        select: {
          name: true,
          type: true,
        },
      },

      slot: {
        select: {
          slotTime: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Parking usage
  const parkingZones = await Promise.all(
    event.eventParkingZones.map(async (mapping) => {
      const booked = await prisma.reservation.count({
        where: {
          eventId: event.id,
          parkingZoneId: mapping.zone.id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
          },
        },
      });

      return {
        ...mapping.zone,
        booked,
      };
    })
  );

  // Arrival slot usage
  const slots = await prisma.arrivalSlot.findMany({
    where: {
      eventId: event.id,
    },
    select: {
      id: true,
      slotTime: true,
      maxEntries: true,
    },
    orderBy: {
      slotTime: 'asc',
    },
  });

  const arrivalSlots = await Promise.all(
    slots.map(async (slot) => {
      const booked = await prisma.reservation.count({
        where: {
          eventId: event.id,
          slotId: slot.id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
          },
        },
      });

      return {
        ...slot,
        booked,
      };
    })
  );

  const totalReservations = reservations.length;

  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === 'CONFIRMED'
  ).length;

  const checkedInReservations = reservations.filter(
    (reservation) => reservation.status === 'CHECKED_IN'
  ).length;

  const cancelledReservations = reservations.filter(
    (reservation) => reservation.status === 'CANCELLED'
  ).length;

  return (
  <main className="min-h-screen bg-slate-950 text-white">
    {/* Navbar */}
    <nav className="border-b border-slate-800 bg-[#07101b]">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-[18px]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[11px] border-2 border-[#18aef5] text-[21px] font-bold text-[#18aef5]">
            P
          </div>

          <span className="text-[25px] font-extrabold tracking-[-0.5px] text-slate-50">
            Event <span className="text-[#159ee8]">Rush</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-[15px] font-medium text-[#aeb8c7] no-underline hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/#how-it-works"
            className="text-[15px] font-medium text-[#aeb8c7] no-underline hover:text-white"
          >
            How It Works
          </Link>

          <Link
            href="/#features"
            className="text-[15px] font-medium text-[#aeb8c7] no-underline hover:text-white"
          >
            Features
          </Link>
        </div>

        {/* Role + Logout */}
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#159ee8]/35 bg-[#159ee8]/10 px-[15px] py-2 text-xs font-extrabold tracking-[1px] text-[#45b8f5]">
            ORGANIZER
          </span>

          <LogoutButton />
        </div>
      </div>
    </nav>

    {/* Page Content */}
    <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href={`/organizer/events/${event.id}`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Event
        </Link>

        <div className="mt-6">
  <p className="mb-2 text-xs font-extrabold tracking-[1.5px] text-[#159ee8]">
    EVENT RUSH / ORGANIZER
  </p>

  <h1 className="text-3xl font-bold">
    Reservations
  </h1>

          <p className="mt-2 text-slate-400">
            {event.title}
          </p>
        </div>

        {/* Reservation Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Reservations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalReservations}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {confirmedReservations}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Checked In
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {checkedInReservations}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Cancelled
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {cancelledReservations}
            </p>
          </div>
        </div>

        {/* Parking Usage */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Parking Usage
          </h2>

          {parkingZones.length === 0 ? (
            <p className="mt-4 text-slate-400">
              No parking zones configured for this event.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {parkingZones.map((zone) => {
                const percentage =
                  zone.capacity > 0
                    ? Math.round(
                        (zone.booked / zone.capacity) * 100
                      )
                    : 0;

                return (
                  <div key={zone.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {zone.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {zone.type}
                        </p>
                      </div>

                      <p className="text-sm text-slate-300">
                        {zone.booked} / {zone.capacity}
                      </p>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {percentage}% occupied
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Arrival Slot Usage */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Arrival Slot Usage
          </h2>

          {arrivalSlots.length === 0 ? (
            <p className="mt-4 text-slate-400">
              No arrival slots configured for this event.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {arrivalSlots.map((slot) => {
                const percentage =
                  slot.maxEntries > 0
                    ? Math.round(
                        (slot.booked / slot.maxEntries) * 100
                      )
                    : 0;

                return (
                  <div key={slot.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {new Date(
                          slot.slotTime
                        ).toLocaleString()}
                      </p>

                      <p className="text-sm text-slate-300">
                        {slot.booked} / {slot.maxEntries}
                      </p>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {percentage}% occupied
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reservations Table */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          {reservations.length === 0 ? (
            <p className="text-slate-400">
              No reservations for this event yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">
                      Attendee
                    </th>

                    <th className="px-4 py-3">
                      Reservation
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Arrival Slot
                    </th>

                    <th className="px-4 py-3">
                      Parking
                    </th>

                    <th className="px-4 py-3">
                      Vehicle
                    </th>

                    <th className="px-4 py-3">
                      Check-in
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium">
                          {reservation.user.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {reservation.user.email}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-mono text-xs">
                        {reservation.code}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                          {reservation.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {reservation.slot
                          ? new Date(
                              reservation.slot.slotTime
                            ).toLocaleString()
                          : 'Not selected'}
                      </td>

                      <td className="px-4 py-4">
                        {reservation.parkingZone
                          ? reservation.parkingZone.name
                          : 'No parking'}
                      </td>

                      <td className="px-4 py-4">
                        <p>
                          {reservation.vehicleNumber}
                        </p>

                        <p className="text-xs text-slate-500">
                          {reservation.vehicleType}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {reservation.checkedInAt
                          ? new Date(
                              reservation.checkedInAt
                            ).toLocaleString()
                          : 'Not checked in'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}