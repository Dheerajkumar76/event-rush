import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'SECURITY' && session.user.role !== 'ADMIN') redirect('/');

  return <main style={{ maxWidth: 760, margin: '80px auto', padding: 24 }}><h1>Security Operations</h1><p>Validate attendee parking passes at the gate.</p><Link href="/security/check-in">Open QR check-in</Link></main>;
}
