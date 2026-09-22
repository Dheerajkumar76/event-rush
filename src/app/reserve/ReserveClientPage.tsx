'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import LogoutButton from '@/components/LogoutButton';

type EventItem = {
  id: string;
  title: string;
  eventDate: string;

  eventParkingZones?: {
    zone: {
      id: string;
      name: string;
      type: string;
      capacity: number;
    };
  }[];

  arrivalSlots?: {
    id: string;
    slotTime: string;
    maxEntries: number;
  }[];
};

type ReservationApiResponse = {
  status: number;
  data: {
    message?: string;
    error?: string;

    reservation?: {
      id: string;
      code: string;
      vehicleNumber: string;
      vehicleType: string;
      status: string;

      user: {
        id: string;
        name: string;
        email: string;
      };

      event: {
        id: string;
        title: string;
        eventDate?: string;
      };

      parkingZone?: {
        id: string;
        name: string;
        type: string;
      } | null;

      slot?: {
        id: string;
        slotTime: string;
      } | null;
    };
  };
};

export default function ReserveClientPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [result, setResult] =
    useState<ReservationApiResponse | null>(null);

  const [form, setForm] = useState({
    eventId: '',
    parkingZoneId: '',
    slotId: '',
    vehicleNumber: 'UP16AB1234',
    vehicleType: 'CAR',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setPageError('');

        const eventsRes = await fetch('/api/events');

        if (!eventsRes.ok) {
          throw new Error('Failed to load events');
        }

        const eventsData = await eventsRes.json();

        setEvents(eventsData);

        const firstEvent = eventsData[0];

        if (firstEvent) {
          setForm({
            eventId: firstEvent.id,
            parkingZoneId:
              firstEvent.eventParkingZones?.[0]?.zone?.id || '',
            slotId:
              firstEvent.arrivalSlots?.[0]?.id || '',
            vehicleNumber: 'UP16AB1234',
            vehicleType: 'CAR',
          });
        }
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : 'Something went wrong'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedEvent = useMemo(
    () =>
      events.find(
        (event) => event.id === form.eventId
      ),
    [events, form.eventId]
  );

  function handleEventChange(eventId: string) {
    const event = events.find(
      (e) => e.id === eventId
    );

    setForm((prev) => ({
      ...prev,
      eventId,
      parkingZoneId:
        event?.eventParkingZones?.[0]?.zone?.id || '',
      slotId:
        event?.arrivalSlots?.[0]?.id || '',
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setResult(null);

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      setResult({
        status: res.status,
        data,
      });
    } catch (error) {
      setResult({
        status: 500,
        data: {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to create reservation',
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  const reservation =
    result?.data?.reservation;

  return (
  <main style={styles.page}>
    <nav style={styles.navbar}>
      <Link href="/" style={styles.logo}>
        <span style={styles.logoBox}>P</span>

        <span>
          Event <span style={styles.logoBlue}>Rush</span>
        </span>
      </Link>

      <div style={styles.navLinks}>
        <Link href="/" style={styles.navLink}>
          Home
        </Link>

        <Link href="/#how-it-works" style={styles.navLink}>
          How It Works
        </Link>

        <Link href="/#features" style={styles.navLink}>
          Features
        </Link>
      </div>

      <div style={styles.navActions}>
        <Link href="/reserve" style={styles.reserveNavButton}>
          Reserve
        </Link>

        <LogoutButton />
      </div>
    </nav>

    <div style={styles.wrapper}>
        <section style={styles.heroCard}>
          <div style={styles.badge}>
            Event Rush
          </div>

          <h1 style={styles.heading}>
            Reserve Parking
          </h1>

          <p style={styles.subtext}>
            Create a reservation for event parking,
            assign an arrival slot, and generate a QR
            pass instantly.
          </p>
        </section>

        <div style={styles.grid}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                Reservation Form
              </h2>

              <p style={styles.cardText}>
                Choose an event, parking zone,
                arrival slot, and vehicle.
              </p>
            </div>

            {loading ? (
              <p style={styles.infoText}>
                Loading events...
              </p>
            ) : pageError ? (
              <div style={styles.errorBox}>
                {pageError}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={styles.form}
              >
                <div style={styles.field}>
                  <label
                    htmlFor="eventId"
                    style={styles.label}
                  >
                    Event
                  </label>

                  <select
                    id="eventId"
                    value={form.eventId}
                    onChange={(e) =>
                      handleEventChange(
                        e.target.value
                      )
                    }
                    style={styles.select}
                  >
                    {events.map((event) => (
                      <option
                        key={event.id}
                        value={event.id}
                      >
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.field}>
                    <label
                      htmlFor="vehicleNumber"
                      style={styles.label}
                    >
                      Vehicle Number
                    </label>

                    <input
                      id="vehicleNumber"
                      type="text"
                      placeholder="Enter vehicle number"
                      value={form.vehicleNumber}
                      required
                      onChange={(e) =>
                        setForm({
                          ...form,
                          vehicleNumber:
                            e.target.value,
                        })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label
                      htmlFor="vehicleType"
                      style={styles.label}
                    >
                      Vehicle Type
                    </label>

                    <select
                      id="vehicleType"
                      value={form.vehicleType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          vehicleType:
                            e.target.value,
                        })
                      }
                      style={styles.select}
                    >
                      <option value="CAR">
                        CAR
                      </option>
                      <option value="BIKE">
                        BIKE
                      </option>
                      <option value="SUV">
                        SUV
                      </option>
                      <option value="VAN">
                        VAN
                      </option>
                      <option value="BUS">
                        BUS
                      </option>
                    </select>
                  </div>
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.field}>
                    <label
                      htmlFor="parkingZoneId"
                      style={styles.label}
                    >
                      Parking Zone
                    </label>

                    <select
                      id="parkingZoneId"
                      value={form.parkingZoneId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          parkingZoneId:
                            e.target.value,
                        })
                      }
                      style={styles.select}
                    >
                      {selectedEvent?.eventParkingZones?.map(
                        (item) => (
                          <option
                            key={item.zone.id}
                            value={item.zone.id}
                          >
                            {item.zone.name} (
                            {item.zone.type}) ·
                            Capacity{' '}
                            {item.zone.capacity}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label
                      htmlFor="slotId"
                      style={styles.label}
                    >
                      Arrival Slot
                    </label>

                    <select
                      id="slotId"
                      value={form.slotId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          slotId:
                            e.target.value,
                        })
                      }
                      style={styles.select}
                    >
                      {selectedEvent?.arrivalSlots?.map(
                        (slot) => (
                          <option
                            key={slot.id}
                            value={slot.id}
                          >
                            {new Date(
                              slot.slotTime
                            ).toLocaleString()}{' '}
                            · Max{' '}
                            {slot.maxEntries}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.button}
                >
                  {submitting
                    ? 'Creating Reservation...'
                    : 'Create Reservation'}
                </button>
              </form>
            )}
          </section>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                Reservation Pass
              </h2>

              <p style={styles.cardText}>
                After a successful booking, view
                your reservation details and QR
                pass from your reservation page.
              </p>
            </div>

            {reservation ? (
              <div style={styles.responseWrap}>
                <div style={styles.successBox}>
                  <p style={styles.successTitle}>
                    {result?.data?.message ||
                      'Reservation created successfully'}
                  </p>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <span
                        style={styles.detailLabel}
                      >
                        Reservation Code
                      </span>

                      <span
                        style={styles.detailValue}
                      >
                        {reservation.code}
                      </span>
                    </div>

                    <div style={styles.detailItem}>
                      <span
                        style={styles.detailLabel}
                      >
                        Status
                      </span>

                      <span
                        style={styles.detailValue}
                      >
                        {reservation.status}
                      </span>
                    </div>

                    <div style={styles.detailItem}>
                      <span
                        style={styles.detailLabel}
                      >
                        Event
                      </span>

                      <span
                        style={styles.detailValue}
                      >
                        {reservation.event.title}
                      </span>
                    </div>

                    <div style={styles.detailItem}>
                      <span
                        style={styles.detailLabel}
                      >
                        Attendee
                      </span>

                      <span
                        style={styles.detailValue}
                      >
                        {reservation.user.name}
                      </span>
                    </div>

                    <div style={styles.detailItem}>
                      <span
                        style={styles.detailLabel}
                      >
                        Vehicle
                      </span>

                      <span
                        style={styles.detailValue}
                      >
                        {reservation.vehicleNumber}{' '}
                        ({reservation.vehicleType})
                      </span>
                    </div>

                    <div style={styles.detailItem}>
                      <span
                        style={styles.detailLabel}
                      >
                        Parking Zone
                      </span>

                      <span
                        style={styles.detailValue}
                      >
                        {reservation.parkingZone
                          ? `${reservation.parkingZone.name} (${reservation.parkingZone.type})`
                          : 'Not assigned'}
                      </span>
                    </div>

                    <div style={styles.detailItem}>
                      <span
                        style={styles.detailLabel}
                      >
                        Arrival Slot
                      </span>

                      <span
                        style={styles.detailValue}
                      >
                        {reservation.slot
                          ?.slotTime
                          ? new Date(
                              reservation.slot.slotTime
                            ).toLocaleString()
                          : 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/my-reservations/${reservation.id}`}
                  style={styles.viewPassButton}
                >
                  View Reservation & QR Pass
                </Link>
              </div>
            ) : result ? (
              <div style={styles.responseWrap}>
                <div style={styles.errorBox}>
                  {result.data.error ||
                    'Reservation could not be created.'}
                </div>
              </div>
            ) : (
              <div style={styles.placeholderBox}>
                <p style={styles.infoText}>
                  No reservation submitted yet.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
    navbar: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    height: '76px',
    padding: '0 6%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    background: 'rgba(5, 11, 20, 0.94)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '22px',
    fontWeight: 800,
    whiteSpace: 'nowrap' as const,
  },

  logoBox: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #28a9ff',
    borderRadius: '9px',
    color: '#28a9ff',
    fontSize: '20px',
    fontWeight: 800,
  },

  logoBlue: {
    color: '#28a9ff',
  },

  navLinks: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },

  navLink: {
    color: '#aeb8c7',
    textDecoration: 'none',
    fontSize: '14px',
  },

  navActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  reserveNavButton: {
    padding: '11px 19px',
    background: '#1687f8',
    color: '#ffffff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    boxShadow: '0 8px 25px rgba(22,135,248,0.25)',
  },
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #0b1020 0%, #111827 45%, #0f172a 100%)',
    color: '#e5e7eb',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },

  wrapper: {
    maxWidth: '1180px',
    margin: '0 auto',
  },

  heroCard: {
    background:
      'rgba(15, 23, 42, 0.85)',
    border:
      '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow:
      '0 20px 50px rgba(0,0,0,0.25)',
  },

  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '999px',
    background:
      'rgba(59, 130, 246, 0.15)',
    color: '#93c5fd',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '12px',
  },

  heading: {
    fontSize: '36px',
    lineHeight: 1.15,
    margin: '0 0 10px 0',
    color: '#f8fafc',
  },

  subtext: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '16px',
    maxWidth: '760px',
    lineHeight: 1.6,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },

  card: {
    background:
      'rgba(15, 23, 42, 0.82)',
    border:
      '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow:
      '0 20px 50px rgba(0,0,0,0.2)',
  },

  cardHeader: {
    marginBottom: '20px',
  },

  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
    color: '#f8fafc',
  },

  cardText: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.6,
  },

  form: {
    display: 'grid',
    gap: '16px',
  },

  twoCol: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },

  field: {
    display: 'grid',
    gap: '8px',
  },

  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#cbd5e1',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border:
      '1px solid rgba(148, 163, 184, 0.25)',
    background: '#0f172a',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '15px',
  },

  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border:
      '1px solid rgba(148, 163, 184, 0.25)',
    background: '#0f172a',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '15px',
  },

  button: {
    marginTop: '8px',
    padding: '14px 18px',
    borderRadius: '14px',
    border: 'none',
    background:
      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow:
      '0 10px 24px rgba(37, 99, 235, 0.35)',
  },

  viewPassButton: {
    display: 'block',
    textAlign: 'center',
    padding: '14px 18px',
    borderRadius: '14px',
    background:
      'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 700,
    boxShadow:
      '0 10px 24px rgba(22, 163, 74, 0.25)',
  },

  responseWrap: {
    display: 'grid',
    gap: '16px',
  },

  successBox: {
    background:
      'rgba(22, 101, 52, 0.18)',
    border:
      '1px solid rgba(74, 222, 128, 0.25)',
    borderRadius: '18px',
    padding: '16px',
  },

  successTitle: {
    margin: '0 0 12px 0',
    color: '#bbf7d0',
    fontSize: '16px',
    fontWeight: 700,
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },

  detailItem: {
    display: 'grid',
    gap: '4px',
  },

  detailLabel: {
    fontSize: '12px',
    color: '#86efac',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  detailValue: {
    fontSize: '14px',
    color: '#f0fdf4',
    wordBreak: 'break-word',
  },

  placeholderBox: {
    minHeight: '240px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '18px',
    background:
      'rgba(2, 6, 23, 0.75)',
    border:
      '1px dashed rgba(148, 163, 184, 0.2)',
  },

  infoText: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },

  errorBox: {
    background:
      'rgba(127, 29, 29, 0.35)',
    color: '#fecaca',
    border:
      '1px solid rgba(248, 113, 113, 0.3)',
    padding: '14px 16px',
    borderRadius: '14px',
    fontSize: '14px',
  },
};