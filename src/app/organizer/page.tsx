import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';

export default async function OrganizerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ORGANIZER') {
    redirect('/');
  }

  const events = await prisma.event.findMany({
    where: {
      organizerId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      status: true,
      venue: {
        select: {
          name: true,
          city: true,
          state: true,
        },
      },
      _count: {
        select: {
          reservations: true,
          arrivalSlots: true,
          eventParkingZones: true,
        },
      },
    },
    orderBy: {
      eventDate: 'asc',
    },
  });

  const totalEvents = events.length;

  const publishedEvents = events.filter(
    (event) => event.status === 'PUBLISHED'
  ).length;

  const draftEvents = events.filter(
    (event) => event.status === 'DRAFT'
  ).length;

  const cancelledEvents = events.filter(
    (event) => event.status === 'CANCELLED'
  ).length;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#070d17',
        color: '#e5e7eb',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          width: '100%',
          borderBottom: '1px solid #1e293b',
          background: '#07101b',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '11px',
                border: '2px solid #18aef5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#18aef5',
                fontSize: '21px',
                fontWeight: 700,
              }}
            >
              P
            </div>

            <span
              style={{
                fontSize: '25px',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.5px',
              }}
            >
              Event <span style={{ color: '#159ee8' }}>Rush</span>
            </span>
          </Link>

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '34px',
            }}
          >
            <Link
              href="/"
              style={{
                color: '#aeb8c7',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              Home
            </Link>

            <Link
              href="/#how-it-works"
              style={{
                color: '#aeb8c7',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              How It Works
            </Link>

            <Link
              href="/#features"
              style={{
                color: '#aeb8c7',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              Features
            </Link>
          </div>

          {/* Role + Logout */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                padding: '8px 15px',
                borderRadius: '999px',
                border: '1px solid rgba(21, 158, 232, 0.35)',
                background: 'rgba(21, 158, 232, 0.08)',
                color: '#45b8f5',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              ORGANIZER
            </span>

            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '42px 16px 60px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '34px',
          }}
        >
          <div>
  <p
    style={{
      margin: '0 0 10px',
      color: '#159ee8',
      fontSize: '12px',
      fontWeight: 800,
      letterSpacing: '1.5px',
    }}
  >
    EVENT RUSH / ORGANIZER
  </p>

  <h1
    style={{
      margin: '0 0 10px',
      fontSize: '40px',
      lineHeight: 1.1,
      letterSpacing: '-1px',
    }}
  >
    Organizer Dashboard
  </h1>

  <p
    style={{
      margin: 0,
      color: '#aeb8c7',
      fontSize: '16px',
    }}
  >
    Welcome, {session.user.name ?? 'Organizer'}
  </p>
</div>

          <Link
            href="/organizer/events/new"
            style={{
              padding: '13px 20px',
              background: '#159ee8',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
            }}
          >
            Create Event
          </Link>
        </div>

        {/* Dashboard Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '42px',
          }}
        >
          <div
            style={{
              padding: '22px',
              border: '1px solid #26354a',
              borderRadius: '14px',
              background: '#0d1624',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#8ea0b8',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Total Events
            </p>

            <p
              style={{
                margin: '10px 0 0',
                fontSize: '34px',
                fontWeight: 700,
              }}
            >
              {totalEvents}
            </p>
          </div>

          <div
            style={{
              padding: '22px',
              border: '1px solid #26354a',
              borderRadius: '14px',
              background: '#0d1624',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#8ea0b8',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Published
            </p>

            <p
              style={{
                margin: '10px 0 0',
                fontSize: '34px',
                fontWeight: 700,
                color: '#4ade80',
              }}
            >
              {publishedEvents}
            </p>
          </div>

          <div
            style={{
              padding: '22px',
              border: '1px solid #26354a',
              borderRadius: '14px',
              background: '#0d1624',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#8ea0b8',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Draft
            </p>

            <p
              style={{
                margin: '10px 0 0',
                fontSize: '34px',
                fontWeight: 700,
                color: '#facc15',
              }}
            >
              {draftEvents}
            </p>
          </div>

          <div
            style={{
              padding: '22px',
              border: '1px solid #26354a',
              borderRadius: '14px',
              background: '#0d1624',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#8ea0b8',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Cancelled
            </p>

            <p
              style={{
                margin: '10px 0 0',
                fontSize: '34px',
                fontWeight: 700,
                color: '#f87171',
              }}
            >
              {cancelledEvents}
            </p>
          </div>
        </div>

        {/* Events */}
        <section>
          <h2
            style={{
              fontSize: '25px',
              margin: '0 0 18px',
            }}
          >
            My Events
          </h2>

          {events.length === 0 ? (
            <div
              style={{
                padding: '26px',
                border: '1px solid #26354a',
                borderRadius: '14px',
                background: '#0d1624',
              }}
            >
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                You have no events yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {events.map((event) => (
  <article
    key={event.id}
    style={{
      padding: '26px',
      border: '1px solid #26354a',
      borderRadius: '16px',
      background: '#0d1624',
    }}
  >
    {/* Event Header */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
      }}
    >
      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: '0 0 8px',
            fontSize: '23px',
            fontWeight: 700,
            color: '#f8fafc',
          }}
        >
          {event.title}
        </h3>

        {event.description && (
          <p
            style={{
              margin: '0 0 20px',
              color: '#9fb0c5',
              fontSize: '15px',
              lineHeight: 1.5,
            }}
          >
            {event.description}
          </p>
        )}
      </div>

      <Link
        href={`/organizer/events/${event.id}`}
        style={{
          padding: '10px 17px',
          border: '1px solid #159ee8',
          borderRadius: '9px',
          color: '#e5e7eb',
          background: 'rgba(21, 158, 232, 0.08)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          fontWeight: 700,
          fontSize: '14px',
        }}
      >
        Manage
      </Link>
    </div>

    {/* Event Information */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px',
        marginTop: '6px',
      }}
    >
      <div
        style={{
          padding: '14px',
          borderRadius: '10px',
          background: '#091321',
          border: '1px solid #1d2a3c',
        }}
      >
        <p
          style={{
            margin: '0 0 5px',
            color: '#71849d',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1px',
          }}
        >
          DATE
        </p>

        <p
          style={{
            margin: 0,
            color: '#e5e7eb',
            fontSize: '14px',
          }}
        >
          {new Date(event.eventDate).toLocaleString()}
        </p>
      </div>

      <div
        style={{
          padding: '14px',
          borderRadius: '10px',
          background: '#091321',
          border: '1px solid #1d2a3c',
        }}
      >
        <p
          style={{
            margin: '0 0 5px',
            color: '#71849d',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1px',
          }}
        >
          VENUE
        </p>

        <p
          style={{
            margin: 0,
            color: '#e5e7eb',
            fontSize: '14px',
          }}
        >
          {event.venue.name}, {event.venue.city}
        </p>
      </div>

      <div
        style={{
          padding: '14px',
          borderRadius: '10px',
          background: '#091321',
          border: '1px solid #1d2a3c',
        }}
      >
        <p
          style={{
            margin: '0 0 5px',
            color: '#71849d',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1px',
          }}
        >
          STATUS
        </p>

        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            background:
              event.status === 'PUBLISHED'
                ? '#14532d'
                : event.status === 'CANCELLED'
                  ? '#7f1d1d'
                  : '#713f12',
            color:
              event.status === 'PUBLISHED'
                ? '#bbf7d0'
                : event.status === 'CANCELLED'
                  ? '#fecaca'
                  : '#fef08a',
          }}
        >
          {event.status}
        </span>
      </div>
    </div>

    {/* Event Metrics */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        marginTop: '14px',
      }}
    >
      <div
        style={{
          padding: '13px 14px',
          borderRadius: '10px',
          background: '#0a1828',
          border: '1px solid #1b354c',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#71849d',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.8px',
          }}
        >
          RESERVATIONS
        </p>

        <p
          style={{
            margin: '5px 0 0',
            fontSize: '20px',
            fontWeight: 700,
            color: '#38bdf8',
          }}
        >
          {event._count.reservations}
        </p>
      </div>

      <div
        style={{
          padding: '13px 14px',
          borderRadius: '10px',
          background: '#0a1828',
          border: '1px solid #1b354c',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#71849d',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.8px',
          }}
        >
          ARRIVAL SLOTS
        </p>

        <p
          style={{
            margin: '5px 0 0',
            fontSize: '20px',
            fontWeight: 700,
            color: '#38bdf8',
          }}
        >
          {event._count.arrivalSlots}
        </p>
      </div>

      <div
        style={{
          padding: '13px 14px',
          borderRadius: '10px',
          background: '#0a1828',
          border: '1px solid #1b354c',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#71849d',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.8px',
          }}
        >
          PARKING ZONES
        </p>

        <p
          style={{
            margin: '5px 0 0',
            fontSize: '20px',
            fontWeight: 700,
            color: '#38bdf8',
          }}
        >
          {event._count.eventParkingZones}
        </p>
      </div>
    </div>
  </article>
))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}