'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  reservationId: string;
};

export default function CancelReservationButton({
  reservationId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?'
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/reservations/${reservationId}`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? 'Failed to cancel reservation');
        return;
      }

      alert('Reservation cancelled successfully');

      router.refresh();
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'Cancelling...' : 'Cancel Reservation'}
    </button>
  );
}