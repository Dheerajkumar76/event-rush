'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
};

type Props = {
  venues: Venue[];
};

export default function CreateEventForm({ venues }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venueId, setVenueId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          eventDate,
          venueId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create event');
        return;
      }

      router.push('/organizer');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Event Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Bangalore Tech Expo 2026"
          required
          minLength={3}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your event..."
          rows={5}
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      {/* Date and Time */}
      <div>
        <label
          htmlFor="eventDate"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Event Date & Time
        </label>

        <input
          id="eventDate"
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
        />
      </div>

      {/* Venue */}
      <div>
        <label
          htmlFor="venue"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Venue
        </label>

        <select
          id="venue"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
        >
          <option value="">Select a venue</option>

          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name} — {venue.city}
            </option>
          ))}
        </select>

        {venueId && (
          <div className="mt-3 rounded-lg bg-slate-800/60 p-4 text-sm text-slate-300">
            {(() => {
              const venue = venues.find(
                (item) => item.id === venueId
              );

              if (!venue) return null;

              return (
                <>
                  <p>{venue.address}</p>

                  <p className="mt-1 text-slate-400">
                    {venue.city}
                    {venue.state ? `, ${venue.state}` : ''}
                  </p>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Creating Event...' : 'Create Event'}
      </button>
    </form>
  );
}