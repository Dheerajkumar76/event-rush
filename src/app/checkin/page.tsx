import { redirect } from 'next/navigation';

export default function LegacyCheckInPage() {
  redirect('/security/check-in');
}
