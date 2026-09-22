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

type EventData = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  venueId: string;
  status: string;
};

type Props = {
  event: EventData;
  venues: Venue[];
};

function formatDateTimeLocal(value: string) {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EditEventForm({
  event,
  venues,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(
    event.description
  );
  const [eventDate, setEventDate] = useState(
    formatDateTimeLocal(event.eventDate)
  );
  const [venueId, setVenueId] = useState(event.venueId);

  const [status, setStatus] = useState(event.status);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(
    formEvent: FormEvent<HTMLFormElement>
  ) {
    formEvent.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/events/${event.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description: description || undefined,
            eventDate,
            venueId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Failed to update event'
        );
        return;
      }

      setMessage('Event updated successfully.');
      router.refresh();
    } catch {
      setError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishToggle() {
    setPublishing(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/events/${event.id}/publish`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            'Failed to update event status'
        );
        return;
      }

      setStatus(data.event.status);
      setMessage(data.message);

      router.refresh();
    } catch {
      setError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this event?'
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/events/${event.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Failed to delete event'
        );
        return;
      }

      router.push('/organizer');
      router.refresh();
    } catch {
      setError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  }

  const isPublished = status === 'PUBLISHED';

  return (
    <>
      {/* Event status */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Event Status
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isPublished
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                }`}
              >
                {status}
              </span>

              <span className="text-sm text-slate-400">
                {isPublished
                  ? 'This event is visible to attendees.'
                  : 'This event is currently hidden from attendees.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={
              loading ||
              deleting ||
              publishing
            }
            className={`rounded-lg px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
              isPublished
                ? 'bg-yellow-600 hover:bg-yellow-500'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {publishing
              ? 'Updating...'
              : isPublished
                ? 'Unpublish Event'
                : 'Publish Event'}
          </button>
        </div>
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium"
          >
            Event Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
            minLength={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={5}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="eventDate"
            className="mb-2 block text-sm font-medium"
          >
            Event Date & Time
          </label>

          <input
            id="eventDate"
            type="datetime-local"
            value={eventDate}
            onChange={(e) =>
              setEventDate(e.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="venue"
            className="mb-2 block text-sm font-medium"
          >
            Venue
          </label>

          <select
            id="venue"
            value={venueId}
            onChange={(e) =>
              setVenueId(e.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
          >
            {venues.map((venue) => (
              <option
                key={venue.id}
                value={venue.id}
              >
                {venue.name} — {venue.city}
              </option>
            ))}
          </select>
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
          disabled={
            loading ||
            deleting ||
            publishing
          }
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? 'Saving...'
            : 'Save Changes'}
        </button>
      </form>

      {/* Delete section */}
      <div className="mt-10 border-t border-slate-800 pt-8">
        <h2 className="text-lg font-semibold text-red-400">
          Delete Event
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          An event with existing reservations
          cannot be deleted.
        </p>

        <button
          type="button"
          onClick={handleDelete}
          disabled={
            loading ||
            deleting ||
            publishing
          }
          className="mt-4 rounded-lg border border-red-800 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {deleting
            ? 'Deleting...'
            : 'Delete Event'}
        </button>
      </div>
    </>
  );
}