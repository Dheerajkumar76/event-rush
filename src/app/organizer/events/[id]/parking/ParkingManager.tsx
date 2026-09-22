'use client';

import { FormEvent, useEffect, useState } from 'react';

type ParkingZone = {
  id: string;
  name: string;
  type: 'VIP' | 'GENERAL' | 'STAFF' | 'DISABLED';
  capacity: number;
};

type Mapping = {
  id: string;
  zone: ParkingZone;
};

type Props = {
  eventId: string;
};

export default function ParkingManager({ eventId }: Props) {
  const [zones, setZones] = useState<Mapping[]>([]);
  const [name, setName] = useState('');
  const [type, setType] =
    useState<ParkingZone['type']>('GENERAL');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  

  useEffect(() => {
  let cancelled = false;

  async function loadInitialZones() {
    try {
      setError('');

      const response = await fetch(
        `/api/events/${eventId}/parking`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to load parking zones'
        );
      }

      if (!cancelled) {
        setZones(data);
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load parking zones'
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadInitialZones();

  return () => {
    cancelled = true;
  };
}, [eventId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const response = await fetch(
        `/api/events/${eventId}/parking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            type,
            capacity: Number(capacity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to create parking zone'
        );
      }

      setZones((current) => [...current, data]);
      setName('');
      setType('GENERAL');
      setCapacity('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create parking zone'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(zoneId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to remove this parking zone?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `/api/events/${eventId}/parking`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zoneId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to remove parking zone'
        );
      }

      setZones((current) =>
        current.filter(
          (mapping) => mapping.zone.id !== zoneId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to remove parking zone'
      );
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        <h2 className="text-xl font-semibold">
          Add Parking Zone
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Zone Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: VIP Parking"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Zone Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as ParkingZone['type']
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            >
              <option value="VIP">VIP</option>
              <option value="GENERAL">General</option>
              <option value="STAFF">Staff</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Capacity
            </label>

            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) =>
                setCapacity(e.target.value)
              }
              placeholder="100"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add Parking Zone'}
        </button>
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">
          Parking Zones
        </h2>

        {loading ? (
          <p className="mt-4 text-slate-400">
            Loading parking zones...
          </p>
        ) : zones.length === 0 ? (
          <p className="mt-4 text-slate-400">
            No parking zones configured yet.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {zones.map((mapping) => (
              <div
                key={mapping.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-white">
                    {mapping.zone.name}
                  </h3>

                  <div className="mt-1 text-sm text-slate-400">
                    Type: {mapping.zone.type}
                  </div>

                  <div className="text-sm text-slate-400">
                    Capacity: {mapping.zone.capacity}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(mapping.zone.id)
                  }
                  className="rounded-lg border border-red-800 px-4 py-2 text-sm text-red-300 hover:bg-red-950"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}