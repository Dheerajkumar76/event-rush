import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import EditEventForm from './EditEventForm';
import CancelEventButton from './CancelEventButton';
import LogoutButton from '@/components/LogoutButton';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({
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
      description: true,
      eventDate: true,
      status: true,
      venueId: true,
      venue: {
        select: {
          name: true,
          address: true,
          city: true,
          state: true,
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
    notFound();
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
    },
    orderBy: {
      name: 'asc',
    },
  });

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
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[11px] border-2 border-[#18aef5] text-[21px] font-bold text-[#18aef5]"
            >
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
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Back to Dashboard */}
        <Link
          href="/organizer"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        {/* Event Summary */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-extrabold tracking-[1.5px] text-[#159ee8]">
                EVENT MANAGEMENT
              </p>

              <h1 className="text-3xl font-bold">
                {event.title}
              </h1>

              <p className="mt-2 text-slate-400">
                Manage your event
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                event.status === 'PUBLISHED'
                  ? 'bg-green-900/50 text-green-300'
                  : event.status === 'CANCELLED'
                    ? 'bg-red-900/50 text-red-300'
                    : 'bg-yellow-900/50 text-yellow-300'
              }`}
            >
              {event.status}
            </span>
          </div>

          {/* Event Information */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Event Date
              </p>

              <p className="mt-1 font-medium">
                {event.eventDate.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Venue
              </p>

              <p className="mt-1 font-medium">
                {event.venue.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {event.venue.city}
                {event.venue.state
                  ? `, ${event.venue.state}`
                  : ''}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Reservations
              </p>

              <p className="mt-1 text-2xl font-bold">
                {event._count.reservations}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Arrival Slots
              </p>

              <p className="mt-1 text-2xl font-bold">
                {event._count.arrivalSlots}
              </p>
            </div>
          </div>
        </div>

        {/* Management Links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/organizer/events/${event.id}/parking`}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Manage Parking
          </Link>

          <Link
            href={`/organizer/events/${event.id}/slots`}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Manage Arrival Slots
          </Link>

          <Link
            href={`/organizer/events/${event.id}/reservations`}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            View Reservations
          </Link>

          {event.status !== 'CANCELLED' && (
            <CancelEventButton eventId={event.id} />
          )}
        </div>

        {/* Edit Event */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Edit Event
          </h2>

          <p className="mt-2 text-slate-400">
            Update your event details.
          </p>

          <div className="mt-8">
            <EditEventForm
              event={{
                id: event.id,
                title: event.title,
                description: event.description ?? '',
                eventDate: event.eventDate.toISOString(),
                venueId: event.venueId,
                status: event.status,
              }}
              venues={venues}
            />
          </div>
        </div>
      </div>
    </main>
  );
}