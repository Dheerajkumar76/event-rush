import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function OrganizerVenuesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ORGANIZER') {
    redirect('/');
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/organizer"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold">
              My Venues
            </h1>

            <p className="mt-1 text-slate-400">
              Manage the venues used for your events.
            </p>
          </div>

          <Link
            href="/organizer/venues/new"
            className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold hover:bg-blue-500"
          >
            + Add Venue
          </Link>
        </div>

        {/* Venue List */}
        {venues.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No venues yet
            </h2>

            <p className="mt-2 text-slate-400">
              Add your first venue to start creating events.
            </p>

            <Link
              href="/organizer/venues/new"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
            >
              Add Your First Venue
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {venues.map((venue) => (
              <article
                key={venue.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {venue.name}
                    </h2>

                    <p className="mt-2 text-slate-300">
                      {venue.address}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {venue.city}
                      {venue.state ? `, ${venue.state}` : ''}
                      {venue.pincode ? ` - ${venue.pincode}` : ''}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    Venue
                  </span>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-800/60 p-4">
                    <p className="text-sm text-slate-400">
                      Events
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {venue._count.events}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800/60 p-4">
                    <p className="text-sm text-slate-400">
                      Parking Zones
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {venue._count.parkingZones}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/organizer/venues/${venue.id}`}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
                  >
                    Manage
                  </Link>

                  <Link
                    href={`/organizer/events/new?venueId=${venue.id}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
                  >
                    Create Event
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}