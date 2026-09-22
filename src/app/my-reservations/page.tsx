import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import CancelReservationButton from './CancelReservationButton';
import LogoutButton from '@/components/LogoutButton';

export default async function MyReservationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ATTENDEE') {
    redirect('/');
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      code: true,
      vehicleNumber: true,
      vehicleType: true,
      status: true,

      event: {
        select: {
          title: true,
          eventDate: true,
        },
      },

      parkingZone: {
        select: {
          name: true,
          type: true,
        },
      },

      slot: {
        select: {
          slotTime: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main style={styles.page}>
      {/* Navbar */}
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
          <Link href="/reserve" style={styles.reserveButton}>
            Reserve
          </Link>

          <LogoutButton />
        </div>
      </nav>

      <div style={styles.wrapper}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>EVENT RUSH</span>

          <h1 style={styles.heading}>My Reservations</h1>

          <p style={styles.subtext}>
            Your event parking reservations and entry passes.
          </p>
        </div>

        {reservations.length === 0 ? (
          <section style={styles.emptyCard}>
            <div style={styles.emptyIcon}>P</div>

            <h2 style={styles.emptyTitle}>
              No reservations yet
            </h2>

            <p style={styles.emptyText}>
              Reserve your parking spot before heading to your event.
            </p>

            <Link href="/reserve" style={styles.primaryButton}>
              Reserve Parking →
            </Link>
          </section>
        ) : (
          <div style={styles.list}>
            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                style={styles.card}
              >
                <div style={styles.cardContent}>
                  <div style={styles.cardTop}>
                    <p style={styles.code}>
                      {reservation.code}
                    </p>

                    <span
                      style={{
                        ...styles.status,
                        ...(reservation.status === 'CHECKED_IN'
                          ? styles.checkedInStatus
                          : reservation.status === 'CANCELLED'
                            ? styles.cancelledStatus
                            : styles.confirmedStatus),
                      }}
                    >
                      {reservation.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h2 style={styles.eventTitle}>
                    {reservation.event.title}
                  </h2>

                  <div style={styles.details}>
                    <p style={styles.detail}>
                      <span style={styles.detailLabel}>Event</span>
                      {new Date(
                        reservation.event.eventDate
                      ).toLocaleString()}
                    </p>

                    <p style={styles.detail}>
                      <span style={styles.detailLabel}>Vehicle</span>
                      {reservation.vehicleType} ·{' '}
                      {reservation.vehicleNumber}
                    </p>

                    <p style={styles.detail}>
                      <span style={styles.detailLabel}>Parking</span>
                      {reservation.parkingZone
                        ? `${reservation.parkingZone.name} (${reservation.parkingZone.type})`
                        : 'Parking zone not assigned'}
                    </p>

                    <p style={styles.detail}>
                      <span style={styles.detailLabel}>Arrival</span>
                      {reservation.slot
                        ? new Date(
                            reservation.slot.slotTime
                          ).toLocaleString()
                        : 'Arrival slot not assigned'}
                    </p>
                  </div>
                </div>

                <div style={styles.actions}>
                  <Link
                    href={`/my-reservations/${reservation.id}`}
                    style={styles.viewButton}
                  >
                    View Pass →
                  </Link>

                  {reservation.status !== 'CANCELLED' &&
                    reservation.status !== 'CHECKED_IN' && (
                      <CancelReservationButton
                        reservationId={reservation.id}
                      />
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#070d18',
    color: '#f5f7fb',
    fontFamily: 'Arial, sans-serif',
  },

  navbar: {
    height: '76px',
    padding: '0 6%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    background: 'rgba(5, 11, 20, 0.96)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
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
    whiteSpace: 'nowrap',
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

  reserveButton: {
    padding: '11px 19px',
    background: '#1687f8',
    color: '#ffffff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    boxShadow: '0 8px 25px rgba(22,135,248,0.25)',
  },

  logoutButton: {
    padding: '11px 19px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: '#0b1726',
    color: '#aeb8c7',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },

  wrapper: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '42px 24px 80px',
  },

  backLink: {
    color: '#28a9ff',
    textDecoration: 'none',
    fontSize: '15px',
  },

  header: {
    marginTop: '10px',
    marginBottom: '36px',
  },

  eyebrow: {
    color: '#28a9ff',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '3px',
  },

  heading: {
    margin: '12px 0 8px',
    fontSize: '48px',
    lineHeight: 1.1,
    fontWeight: 700,
  },

  subtext: {
    margin: 0,
    color: '#8fa4bf',
    fontSize: '17px',
  },

  list: {
    display: 'grid',
    gap: '18px',
  },

  card: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '28px',
    padding: '24px',
    borderRadius: '18px',
    border: '1px solid #24344a',
    background: '#0d1727',
    boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
  },

  cardContent: {
    flex: 1,
    minWidth: 0,
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },

  code: {
    margin: 0,
    color: '#54b7ff',
    fontSize: '14px',
    fontWeight: 700,
  },

  status: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '7px 12px',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },

  confirmedStatus: {
    background: 'rgba(37, 99, 235, 0.18)',
    color: '#60a5fa',
    border: '1px solid rgba(37,99,235,0.35)',
  },

  checkedInStatus: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#6ee7b7',
    border: '1px solid rgba(16,185,129,0.3)',
  },

  cancelledStatus: {
    background: 'rgba(239, 68, 68, 0.13)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.3)',
  },

  eventTitle: {
    margin: '14px 0 18px',
    fontSize: '24px',
    fontWeight: 600,
  },

  details: {
    display: 'grid',
    gap: '8px',
  },

  detail: {
    margin: 0,
    color: '#aebdd0',
    fontSize: '15px',
  },

  detailLabel: {
    display: 'inline-block',
    width: '72px',
    color: '#607894',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: '12px',
    minWidth: '150px',
  },

  viewButton: {
    display: 'inline-block',
    textAlign: 'center',
    borderRadius: '10px',
    padding: '12px 18px',
    background: '#1687f8',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px',
    boxShadow: '0 8px 24px rgba(22,135,248,0.2)',
  },

  emptyCard: {
    padding: '60px 30px',
    borderRadius: '18px',
    border: '1px solid #24344a',
    background: '#0d1727',
    textAlign: 'center',
  },

  emptyIcon: {
    width: '52px',
    height: '52px',
    margin: '0 auto 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #28a9ff',
    borderRadius: '14px',
    color: '#28a9ff',
    fontSize: '24px',
    fontWeight: 800,
  },

  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '24px',
  },

  emptyText: {
    margin: '0 0 24px',
    color: '#8fa4bf',
  },

  primaryButton: {
    display: 'inline-block',
    padding: '12px 20px',
    borderRadius: '10px',
    background: '#1687f8',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 700,
  },
};