'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  eventId: string;
};

export default function CancelEventButton({
  eventId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function cancelEvent() {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this event?'
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/events/${eventId}`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to cancel event'
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to cancel event'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={cancelEvent}
        disabled={loading}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Cancelling...' : 'Cancel Event'}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}