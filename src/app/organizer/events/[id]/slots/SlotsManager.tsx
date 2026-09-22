'use client';

import { FormEvent, useEffect, useState } from 'react';

type Slot = {
  id: string;
  slotTime: string;
  maxEntries: number;
  _count?: {
    reservations: number;
  };
};

type Props = {
  eventId: string;
};

export default function SlotsManager({ eventId }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotTime, setSlotTime] = useState('');
  const [maxEntries, setMaxEntries] = useState('20');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialSlots() {
      try {
        setError('');

        const response = await fetch(
          `/api/events/${eventId}/slots`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Failed to load arrival slots'
          );
        }

        if (!cancelled) {
          setSlots(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load arrival slots'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialSlots();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function addSlot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setSaving(true);

    try {
      const response = await fetch(
        `/api/events/${eventId}/slots`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slotTime,
            maxEntries: Number(maxEntries),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to create slot'
        );
      }

      setSlotTime('');
      setMaxEntries('20');

      const refreshResponse = await fetch(
        `/api/events/${eventId}/slots`
      );

      const updatedSlots = await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw new Error(
          updatedSlots.error ||
            'Slot created, but failed to refresh the list'
        );
      }

      setSlots(updatedSlots);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create slot'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(slotId: string) {
    const confirmed = window.confirm(
      'Delete this arrival slot?'
    );

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      const response = await fetch(
        `/api/events/${eventId}/slots`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slotId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to delete slot'
        );
      }

      const refreshResponse = await fetch(
        `/api/events/${eventId}/slots`
      );

      const updatedSlots = await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw new Error(
          updatedSlots.error ||
            'Slot deleted, but failed to refresh the list'
        );
      }

      setSlots(updatedSlots);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete slot'
      );
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={addSlot}
        className="rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        <h2 className="text-xl font-semibold">
          Add Arrival Slot
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            type="datetime-local"
            value={slotTime}
            onChange={(e) =>
              setSlotTime(e.target.value)
            }
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
          />

          <input
            type="number"
            min="1"
            value={maxEntries}
            onChange={(e) =>
              setMaxEntries(e.target.value)
            }
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add Slot'}
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Current Slots
        </h2>

        {loading ? (
          <p className="text-slate-400">
            Loading arrival slots...
          </p>
        ) : slots.length === 0 ? (
          <p className="text-slate-400">
            No arrival slots configured yet.
          </p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(
                      slot.slotTime
                    ).toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Maximum entries: {slot.maxEntries}
                    {slot._count
                      ? ` · Booked: ${slot._count.reservations}`
                      : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    deleteSlot(slot.id)
                  }
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}