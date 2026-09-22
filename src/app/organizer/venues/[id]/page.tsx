import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import ManageVenueForm from './ManageVenueForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ManageVenuePage({
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

  const venue = await prisma.venue.findFirst({
    where: {
      id,
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
  });

  if (!venue) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/organizer/venues"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Venues
        </Link>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Manage Venue
            </h1>

            <p className="mt-2 text-slate-400">
              Update the details of your venue.
            </p>
          </div>

          <ManageVenueForm
            venue={{
              id: venue.id,
              name: venue.name,
              address: venue.address,
              city: venue.city,
              state: venue.state ?? '',
              pincode: venue.pincode ?? '',
            }}
            eventCount={venue._count.events}
            parkingZoneCount={venue._count.parkingZones}
          />
        </div>
      </div>
    </main>
  );
}