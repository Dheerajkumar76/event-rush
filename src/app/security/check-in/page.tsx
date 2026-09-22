import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import CheckInClient from './CheckInClient';

export default async function SecurityCheckInPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'SECURITY' && session.user.role !== 'ADMIN') redirect('/');
  return <CheckInClient />;
}
