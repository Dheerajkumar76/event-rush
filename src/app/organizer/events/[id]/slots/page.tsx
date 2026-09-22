import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import SlotsManager from './SlotsManager';
import LogoutButton from '@/components/LogoutButton';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SlotsPage({ params }: PageProps) {
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
    },
  });

  if (!event) {
    notFound();
  }

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
      <div className="mx-auto max-w-4xl px-6 py-10">
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
            Arrival Slots
          </h1>

          <p className="mt-2 text-slate-400">
            Manage arrival time slots for{' '}
            <span className="text-white">{event.title}</span>.
          </p>
        </div>

        <div className="mt-8">
          <SlotsManager eventId={event.id} />
        </div>
      </div>
    </main>
  );
}