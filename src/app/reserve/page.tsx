import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import ReserveClientPage from './ReserveClientPage';


export default async function ReservePage() {
  const session = await getServerSession(authOptions);

  // User is not logged in
  if (!session?.user) {
    redirect('/login');
  }

  // Only attendees can make reservations

  if (session.user.role !== 'ATTENDEE') {
    redirect('/');
  }

  return <ReserveClientPage />;
}
