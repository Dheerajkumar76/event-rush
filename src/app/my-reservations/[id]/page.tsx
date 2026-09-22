import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import ReservationQRCode from '@/components/ReservationQRCode';
import LogoutButton from '@/components/LogoutButton';
import { prisma } from '@/lib/prisma';

type ReservationPassPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationPassPage({
  params,
}: ReservationPassPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ATTENDEE') {
    redirect('/');
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      code: true,
      vehicleNumber: true,
      vehicleType: true,
      status: true,

      user: {
        select: {
          name: true,
        },
      },

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

      qrPass: {
        select: {
          qrToken: true,
        },
      },
    },
  });

  if (!reservation) {
    notFound();
  }

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
        <Link
          href="/my-reservations"
          style={styles.backLink}
        >
          ← My Reservations
        </Link>

        <div style={styles.header}>
          <span style={styles.eyebrow}>EVENT RUSH</span>

          <h1 style={styles.heading}>Parking Pass</h1>

          <p style={styles.subtext}>
            Your reservation and secure event entry pass.
          </p>
        </div>

        <section style={styles.card}>
          {/* Reservation information */}
          <div style={styles.detailsSection}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.code}>
                  {reservation.code}
                </p>

                <h2 style={styles.eventTitle}>
                  {reservation.event.title}
                </h2>
              </div>

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

            <div style={styles.details}>
              <div style={styles.detailRow}>
                <span style={styles.label}>EVENT</span>
                <span>
                  {new Date(
                    reservation.event.eventDate
                  ).toLocaleString()}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>VEHICLE</span>
                <span>
                  {reservation.vehicleType} ·{' '}
                  {reservation.vehicleNumber}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>PARKING</span>
                <span>
                  {reservation.parkingZone
                    ? `${reservation.parkingZone.name} (${reservation.parkingZone.type})`
                    : 'Parking zone not assigned'}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>ARRIVAL</span>
                <span>
                  {reservation.slot
                    ? new Date(
                        reservation.slot.slotTime
                      ).toLocaleString()
                    : 'Arrival slot not assigned'}
                </span>
              </div>
            </div>

            <div style={styles.notice}>
              <span style={styles.noticeIcon}>✓</span>

              <div>
                <strong>Ready for entry</strong>

                <p>
                  Show this QR pass at the event entrance.
                </p>
              </div>
            </div>
          </div>

          {/* QR Pass */}
          <div style={styles.qrSection}>
            {reservation.qrPass ? (
              <>
                <ReservationQRCode
                  code={reservation.qrPass.qrToken}
                  eventTitle={reservation.event.title}
                  attendeeName={reservation.user.name}
                />

                <p style={styles.qrHint}>
                  Scan this code at the entrance
                </p>
              </>
            ) : (
              <div style={styles.qrError}>
                <p>
                  A pass has not been issued for this
                  reservation.
                </p>
              </div>
            )}
          </div>
        </section>
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
    marginTop: '32px',
    marginBottom: '34px',
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

  card: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 390px',
    gap: '40px',
    alignItems: 'center',
    padding: '34px',
    borderRadius: '20px',
    border: '1px solid #24344a',
    background: '#0d1727',
    boxShadow: '0 18px 50px rgba(0,0,0,0.2)',
  },

  detailsSection: {
    minWidth: 0,
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '30px',
  },

  code: {
    margin: 0,
    color: '#54b7ff',
    fontSize: '14px',
    fontWeight: 700,
  },

  eventTitle: {
    margin: '12px 0 0',
    fontSize: '30px',
    lineHeight: 1.2,
    fontWeight: 700,
  },

  status: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '8px 13px',
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

  details: {
    display: 'grid',
    gap: '17px',
  },

  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: '#cbd7e6',
    fontSize: '15px',
  },

  label: {
    width: '75px',
    flexShrink: 0,
    color: '#607894',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1px',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '32px',
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(22, 135, 248, 0.08)',
    border: '1px solid rgba(22, 135, 248, 0.18)',
    color: '#dbeafe',
  },

  noticeIcon: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: '#1687f8',
    color: '#ffffff',
    fontWeight: 800,
  },

  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderRadius: '18px',
    background: '#07101e',
    border: '1px solid #1c2b40',
  },

  qrHint: {
    margin: '16px 0 0',
    color: '#8fa4bf',
    fontSize: '13px',
    textAlign: 'center',
  },

  qrError: {
    minHeight: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#fca5a5',
  },
};