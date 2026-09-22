import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      eventDate: true,
      status: true,

      organizer: {
        select: {
          name: true,
          email: true,
        },
      },

      venue: {
        select: {
          name: true,
          city: true,
          state: true,
        },
      },

      _count: {
        select: {
          reservations: true,
        },
      },
    },

    orderBy: {
      eventDate: 'asc',
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#07101b]">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-[18px]">
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

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#159ee8]/35 bg-[#159ee8]/10 px-[15px] py-2 text-xs font-extrabold tracking-[1px] text-[#45b8f5]">
              ADMIN
            </span>

            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/admin"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="mt-6">
          <p className="mb-2 text-xs font-extrabold tracking-[1.5px] text-[#159ee8]">
            EVENT RUSH / ADMIN
          </p>

          <h1 className="text-3xl font-bold">
            Event Management
          </h1>

          <p className="mt-2 text-slate-400">
            View all events registered in Event Rush.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          {events.length === 0 ? (
            <div className="p-6">
              <p className="text-slate-400">
                No events found.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-5 py-4">
                    Event
                  </th>

                  <th className="px-5 py-4">
                    Organizer
                  </th>

                  <th className="px-5 py-4">
                    Venue
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Reservations
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {event.title}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {event.organizer.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {event.organizer.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p>
                        {event.venue.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {event.venue.city}
                        {event.venue.state
                          ? `, ${event.venue.state}`
                          : ''}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {new Date(
                        event.eventDate
                      ).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {event._count.reservations}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          event.status === 'PUBLISHED'
                            ? 'bg-green-900/50 text-green-300'
                            : event.status === 'CANCELLED'
                              ? 'bg-red-900/50 text-red-300'
                              : 'bg-yellow-900/50 text-yellow-300'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}