import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';
import AdminCreateUserForm from '@/components/AdminCreateUserForm';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
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
      <div className="mx-auto max-w-6xl px-6 py-10">
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
            User Management
          </h1>

          <p className="mt-2 text-slate-400">
            View all registered Event Rush users.
          </p>
        </div>
        <AdminCreateUserForm />
        
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          {users.length === 0 ? (
            <div className="p-6">
              <p className="text-slate-400">
                No users found.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-5 py-4">
                    Name
                  </th>

                  <th className="px-5 py-4">
                    Email
                  </th>

                  <th className="px-5 py-4">
                    Role
                  </th>

                  <th className="px-5 py-4">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 font-medium">
                      {user.name}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-red-900/50 text-red-300'
                            : user.role === 'ORGANIZER'
                              ? 'bg-blue-900/50 text-blue-300'
                              : user.role === 'SECURITY'
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(
                        user.createdAt
                      ).toLocaleString()}
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