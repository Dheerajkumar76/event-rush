import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import AddVenueForm from './AddVenueForm';

export default async function AddVenuePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ORGANIZER') {
    redirect('/');
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
          <h1 className="text-3xl font-bold">
            Add Venue
          </h1>

          <p className="mt-2 text-slate-400">
            Add a venue where you will host your events.
          </p>

          <div className="mt-8">
            <AddVenueForm />
          </div>
        </div>
      </div>
    </main>
  );
}