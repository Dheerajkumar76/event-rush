'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type Props = {
  venue: Venue;
  eventCount: number;
  parkingZoneCount: number;
};

export default function ManageVenueForm({
  venue,
  eventCount,
  parkingZoneCount,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(venue.name);
  const [address, setAddress] = useState(venue.address);
  const [city, setCity] = useState(venue.city);
  const [state, setState] = useState(venue.state);
  const [pincode, setPincode] = useState(venue.pincode);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/venues/${venue.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          address,
          city,
          state: state || undefined,
          pincode: pincode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update venue');
        return;
      }

      setMessage('Venue updated successfully.');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (eventCount > 0) {
      setError(
        'This venue cannot be deleted because it has events.'
      );
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this venue?'
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/venues/${venue.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete venue');
        return;
      }

      router.push('/organizer/venues');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Venue Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-slate-800/60 p-4">
          <p className="text-sm text-slate-400">
            Events
          </p>

          <p className="mt-1 text-2xl font-bold">
            {eventCount}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/60 p-4">
          <p className="text-sm text-slate-400">
            Parking Zones
          </p>

          <p className="mt-1 text-2xl font-bold">
            {parkingZoneCount}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Venue Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium"
          >
            Address
          </label>

          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            minLength={3}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-medium"
          >
            City
          </label>

          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            minLength={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="state"
              className="mb-2 block text-sm font-medium"
            >
              State
            </label>

            <input
              id="state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="pincode"
              className="mb-2 block text-sm font-medium"
            >
              Pincode
            </label>

            <input
              id="pincode"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={10}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || deleting}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Delete Section */}
      <div className="mt-10 border-t border-slate-800 pt-8">
        <h2 className="text-lg font-semibold text-red-400">
          Delete Venue
        </h2>

        {eventCount > 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            This venue has {eventCount} event
            {eventCount === 1 ? '' : 's'}. It cannot be
            deleted while events are associated with it.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Deleting this venue cannot be undone.
          </p>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={eventCount > 0 || deleting || loading}
          className="mt-4 rounded-lg border border-red-800 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {deleting ? 'Deleting...' : 'Delete Venue'}
        </button>
      </div>
    </>
  );
}