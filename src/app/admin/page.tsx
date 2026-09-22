import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const [
    totalUsers,
    totalEvents,
    totalReservations,
    totalCheckIns,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.event.count(),

    prisma.reservation.count(),

    prisma.reservation.count({
      where: {
        status: 'CHECKED_IN',
      },
    }),
  ]);

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
              ADMIN
            </span>

            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div>
          <p className="mb-2 text-xs font-extrabold tracking-[1.5px] text-[#159ee8]">
            EVENT RUSH / ADMIN
          </p>

          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Welcome, {session.user.name ?? 'Admin'}
          </p>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Events
            </p>

            <p className="mt-2 text-3xl font-bold text-[#159ee8]">
              {totalEvents}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Reservations
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {totalReservations}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Check-ins
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-400">
              {totalCheckIns}
            </p>
          </div>
        </div>

        {/* Admin Management */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Admin Management
          </h2>

          <p className="mt-2 text-slate-400">
            Manage users, events, reservations, and check-in records.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-5 text-center font-semibold text-white transition hover:border-[#159ee8] hover:bg-slate-800"
            >
              Manage Users
            </Link>

            <Link
              href="/admin/events"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-5 text-center font-semibold text-white transition hover:border-[#159ee8] hover:bg-slate-800"
            >
              Manage Events
            </Link>

            <Link
              href="/admin/reservations"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-5 text-center font-semibold text-white transition hover:border-[#159ee8] hover:bg-slate-800"
            >
              Manage Reservations
            </Link>

            <Link
              href="/admin/check-ins"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-5 text-center font-semibold text-white transition hover:border-[#159ee8] hover:bg-slate-800"
            >
              View Check-ins
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}