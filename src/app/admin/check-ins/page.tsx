import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminCheckInsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const checkIns = await prisma.reservation.findMany({
    where: {
      status: 'CHECKED_IN',
      checkedInAt: {
        not: null,
      },
      checkedInById: {
        not: null,
      },
    },

    select: {
      id: true,
      code: true,
      vehicleNumber: true,
      vehicleType: true,
      checkedInAt: true,

      user: {
        select: {
          name: true,
          email: true,
        },
      },

      event: {
        select: {
          title: true,
        },
      },

      checkedInBy: {
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
      checkedInAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-sky-500 text-xl font-bold text-sky-400">
              P
            </div>

            <span className="text-3xl font-extrabold tracking-tight">
              <span className="text-white">Event</span>{' '}
              <span className="text-sky-500">Rush</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            <Link
              href="/"
              className="text-base text-slate-300 transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/#how-it-works"
              className="text-base text-slate-300 transition hover:text-white"
            >
              How It Works
            </Link>

            <Link
              href="/#features"
              className="text-base text-slate-300 transition hover:text-white"
            >
              Features
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2 text-sm font-bold tracking-wider text-sky-400">
              ADMIN
            </span>

            <LogoutButton />
          </div>

        </div>
      </header>

      {/* Page Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">

        <Link
          href="/admin"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-bold tracking-[0.18em] text-sky-500">
            EVENT RUSH / ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Check-in Management
          </h1>

          <p className="mt-3 text-lg text-slate-400">
            View all completed event check-ins.
          </p>
        </div>

        {/* Check-in Table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

          {checkIns.length === 0 ? (
            <div className="p-8">
              <p className="text-slate-400">
                No check-ins found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">

                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <th className="px-5 py-5 font-semibold">
                      Attendee
                    </th>

                    <th className="px-5 py-5 font-semibold">
                      Event
                    </th>

                    <th className="px-5 py-5 font-semibold">
                      Reservation
                    </th>

                    <th className="px-5 py-5 font-semibold">
                      Vehicle
                    </th>

                    <th className="px-5 py-5 font-semibold">
                      Parking
                    </th>

                    <th className="px-5 py-5 font-semibold">
                      Arrival Slot
                    </th>

                    <th className="px-5 py-5 font-semibold">
                      Checked In By
                    </th>

                    <th className="px-5 py-5 font-semibold">
                      Check-in Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {checkIns.map((checkIn) => (
                    <tr
                      key={checkIn.id}
                      className="border-b border-slate-800 last:border-0 transition hover:bg-slate-800/40"
                    >

                      {/* Attendee */}
                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {checkIn.user.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {checkIn.user.email}
                        </p>
                      </td>

                      {/* Event */}
                      <td className="max-w-[190px] px-5 py-5">
                        <p className="font-medium leading-5 text-white">
                          {checkIn.event.title}
                        </p>
                      </td>

                      {/* Reservation */}
                      <td className="px-5 py-5">
                        <span className="rounded-md bg-slate-800 px-2.5 py-1 font-mono text-xs text-sky-300">
                          {checkIn.code}
                        </span>
                      </td>

                      {/* Vehicle */}
                      <td className="px-5 py-5">
                        <p className="font-medium text-white">
                          {checkIn.vehicleNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {checkIn.vehicleType}
                        </p>
                      </td>

                      {/* Parking */}
                      <td className="max-w-[180px] px-5 py-5">
                        {checkIn.parkingZone ? (
                          <>
                            <p className="font-medium text-white">
                              {checkIn.parkingZone.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {checkIn.parkingZone.type}
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-500">
                            No parking
                          </span>
                        )}
                      </td>

                      {/* Arrival Slot */}
                      <td className="px-5 py-5 text-slate-300">
                        {checkIn.slot ? (
                          new Date(
                            checkIn.slot.slotTime
                          ).toLocaleString()
                        ) : (
                          <span className="text-slate-500">
                            Not selected
                          </span>
                        )}
                      </td>

                      {/* Checked In By */}
                      <td className="px-5 py-5">
                        <p className="font-medium text-white">
                          {checkIn.checkedInBy?.name ?? 'Unknown'}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {checkIn.checkedInBy?.email ?? 'Unknown'}
                        </p>
                      </td>

                      {/* Check-in Time */}
                      <td className="px-5 py-5">
                        {checkIn.checkedInAt ? (
                          <span className="text-slate-300">
                            {new Date(
                              checkIn.checkedInAt
                            ).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Unknown
                          </span>
                        )}
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