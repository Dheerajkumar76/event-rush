import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import CreateEventForm from './CreateEventForm';

export default async function CreateEventPage() {
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
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/organizer"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h1 className="text-3xl font-bold">
            Create Event
          </h1>

          <p className="mt-2 text-slate-400">
            Create a new event for your attendees.
          </p>

          {venues.length === 0 ? (
            <div className="mt-8 rounded-lg border border-yellow-800 bg-yellow-950/30 p-5">
              <h2 className="font-semibold text-yellow-300">
                You need a venue first
              </h2>

              <p className="mt-2 text-sm text-yellow-200/80">
                Create a venue before creating an event.
              </p>

              <Link
                href="/organizer/venues/new"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
              >
                Add Venue
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <CreateEventForm venues={venues} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}