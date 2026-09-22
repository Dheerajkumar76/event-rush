import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main style={styles.page}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <Link href="/" style={styles.logo}>
          <span style={styles.logoBox}>P</span>
          <span>
            Event <span style={styles.logoBlue}>Rush</span>
          </span>
        </Link>

        <div style={styles.navLinks}>
          <a href="#home" style={styles.navLink}>
            Home
          </a>

          <a href="#how-it-works" style={styles.navLink}>
            How It Works
          </a>

          <a href="#features" style={styles.navLink}>
            Features
          </a>
        </div>

        <div style={styles.navActions}>
  {!session?.user ? (
    <>
      <Link href="/login" style={styles.loginButton}>
        Login
      </Link>

      <Link href="/reserve" style={styles.primaryButton}>
        Get Started
      </Link>
    </>
  ) : (
    <>
      <Link href="/my-reservations" style={styles.navLink}>
        My Reservations
      </Link>

      <Link href="/reserve" style={styles.primaryButton}>
        Reserve
      </Link>

      <LogoutButton />
    </>
  )}
</div>
      </nav>

      {/* HERO */}
      <section id="home" style={styles.hero}>
        <div style={styles.heroImage} />
        <div style={styles.heroOverlay} />

        <div style={styles.heroContent}>
          <div style={styles.badge}>
            🚗 SMART PARKING FOR BIGGER EXPERIENCES
          </div>

          <h1 style={styles.heroTitle}>
            Park Smart.
            <br />
            <span style={styles.blueText}>Enjoy More.</span>
          </h1>

          <p style={styles.heroDescription}>
            Event Rush makes event parking simple, secure, and stress-free.
            Reserve your parking spot, get your QR pass, and enter your event
            with confidence.
          </p>

          <div style={styles.heroButtons}>
            <Link href="/reserve" style={styles.heroPrimaryButton}>
              Get Started →
            </Link>

            <a href="#how-it-works" style={styles.heroSecondaryButton}>
              ▶ How It Works
            </a>
          </div>

          <div style={styles.heroFeatures}>
            <div>
              <strong style={styles.featureNumber}>01</strong>
              <span>Choose an Event</span>
            </div>

            <div>
              <strong style={styles.featureNumber}>02</strong>
              <span>Reserve Parking</span>
            </div>

            <div>
              <strong style={styles.featureNumber}>03</strong>
              <span>Scan & Enter</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section style={styles.intro}>
        <p style={styles.sectionLabel}>EVENT RUSH</p>

        <h2 style={styles.sectionTitle}>
          Your event starts
          <br />
          <span style={styles.blueText}>before you enter.</span>
        </h2>

        <p style={styles.sectionDescription}>
          From finding the right parking zone to walking through the entrance,
          Event Rush brings the entire event-entry experience into one simple
          platform.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={styles.howSection}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionLabel}>HOW IT WORKS</p>

          <h2 style={styles.sectionTitle}>
            From reservation
            <br />
            to entry in <span style={styles.blueText}>minutes.</span>
          </h2>
        </div>

        <div style={styles.steps}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>01</div>
            <div style={styles.stepIcon}>📅</div>

            <h3 style={styles.stepTitle}>Choose an Event</h3>

            <p style={styles.stepText}>
              Find your event and select the date and venue that works for you.
            </p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>02</div>
            <div style={styles.stepIcon}>🚗</div>

            <h3 style={styles.stepTitle}>Reserve Parking</h3>

            <p style={styles.stepText}>
              Pick an available parking zone and arrival slot before you reach
              the venue.
            </p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>03</div>
            <div style={styles.stepIcon}>▣</div>

            <h3 style={styles.stepTitle}>Get Your QR Pass</h3>

            <p style={styles.stepText}>
              Receive a secure QR pass linked to your reservation.
            </p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>04</div>
            <div style={styles.stepIcon}>✓</div>

            <h3 style={styles.stepTitle}>Drive In & Enjoy</h3>

            <p style={styles.stepText}>
              Scan your pass at the entrance and get checked in quickly.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionLabel}>BUILT FOR EVERYONE</p>

          <h2 style={styles.sectionTitle}>
            One platform.
            <br />
            <span style={styles.blueText}>Three experiences.</span>
          </h2>
        </div>

        <div style={styles.featureGrid}>
          <div style={styles.largeFeatureCard}>
            <div style={styles.featureIcon}>🎟️</div>

            <h3 style={styles.featureTitle}>For Attendees</h3>

            <p style={styles.featureText}>
              Reserve parking, choose an arrival slot, manage your reservation,
              and carry your QR pass right from your phone.
            </p>

            <Link href="/register" style={styles.featureLink}>
              Reserve your spot →
            </Link>
          </div>

          <div style={styles.largeFeatureCard}>
            <div style={styles.featureIcon}>🏢</div>

            <h3 style={styles.featureTitle}>For Organizers</h3>

            <p style={styles.featureText}>
              Manage venues, events, parking zones, arrival slots, reservations,
              and attendee check-ins from one dashboard.
            </p>

            <Link href="/login" style={styles.featureLink}>
              Organizer login →
            </Link>
          </div>

          <div style={styles.largeFeatureCard}>
            <div style={styles.featureIcon}>📱</div>

            <h3 style={styles.featureTitle}>Secure Entry</h3>

            <p style={styles.featureText}>
              QR-based check-in gives security teams a fast and reliable way to
              validate reservations at the gate.
            </p>

            <Link href="/login" style={styles.featureLink}>
              Security login →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.ctaSection}>
        <p style={styles.sectionLabel}>READY TO RUSH IN?</p>

        <h2 style={styles.ctaTitle}>
          Spend less time
          <br />
          <span style={styles.blueText}>finding parking.</span>
        </h2>

        <p style={styles.ctaText}>
          Plan your parking before you arrive and make every event entry
          smoother.
        </p>

        <Link href="/reserve" style={styles.heroPrimaryButton}>
          Get Started →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div>
          <div style={styles.footerLogo}>
            Event <span style={styles.logoBlue}>Rush</span>
          </div>

          <p style={styles.footerText}>
            Smart parking and entry management for events.
          </p>
        </div>

        <p style={styles.footerCopyright}>
          © 2026 Event Rush. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#050b14',
    color: '#f5f7fb',
    fontFamily: 'Arial, Helvetica, sans-serif',
    overflowX: 'hidden' as const,
  },

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

  loginButton: {
    padding: '10px 18px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },

  primaryButton: {
    padding: '11px 19px',
    background: '#1687f8',
    color: '#ffffff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    boxShadow: '0 8px 25px rgba(22,135,248,0.25)',
  },

  hero: {
    position: 'relative' as const,
    minHeight: '650px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    background: '#050b14',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  heroImage: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '54%',
    borderRadius: '28px 0 0 28px',
    height: '100%',
    backgroundImage: 'url("/event-rush-parking-hero.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    zIndex: 0,
  },

  heroOverlay: {
    position: 'absolute' as const,
    inset: 0,
    zIndex: 1,
    background:
      'linear-gradient(90deg, #050b14 0%, rgba(5,11,20,0.92) 30%, rgba(5,11,20,0.35) 62%, rgba(5,11,20,0.05) 100%)',
  },

  heroContent: {
    position: 'relative' as const,
    zIndex: 2,
    width: '100%',
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '90px 6%',
  },

  badge: {
    display: 'inline-block',
    padding: '9px 15px',
    marginBottom: '22px',
    border: '1px solid rgba(40,169,255,0.45)',
    borderRadius: '999px',
    background: 'rgba(40,169,255,0.08)',
    color: '#54bbff',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.6px',
  },

  heroTitle: {
    margin: 0,
    maxWidth: '650px',
    fontSize: 'clamp(48px, 7vw, 82px)',
    lineHeight: 0.98,
    letterSpacing: '-3px',
    fontWeight: 800,
  },

  blueText: {
    color: '#28a9ff',
  },

  heroDescription: {
    maxWidth: '570px',
    marginTop: '28px',
    color: '#b7c2d1',
    fontSize: '18px',
    lineHeight: 1.7,
  },

  heroButtons: {
    display: 'flex',
    gap: '14px',
    marginTop: '32px',
    flexWrap: 'wrap' as const,
  },

  heroPrimaryButton: {
    display: 'inline-block',
    padding: '15px 25px',
    borderRadius: '11px',
    background: '#1687f8',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 700,
    boxShadow: '0 12px 35px rgba(22,135,248,0.28)',
  },

  heroSecondaryButton: {
    display: 'inline-block',
    padding: '14px 23px',
    borderRadius: '11px',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.03)',
  },

  heroFeatures: {
    display: 'flex',
    gap: '45px',
    marginTop: '58px',
    flexWrap: 'wrap' as const,
  },

  featureNumber: {
    display: 'block',
    color: '#28a9ff',
    fontSize: '22px',
    marginBottom: '5px',
  },

  intro: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '110px 6% 80px',
    textAlign: 'center' as const,
  },

  sectionLabel: {
    margin: 0,
    color: '#28a9ff',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '2px',
  },

  sectionTitle: {
    margin: '14px 0 20px',
    fontSize: 'clamp(34px, 5vw, 55px)',
    lineHeight: 1.08,
    letterSpacing: '-1.5px',
  },

  sectionDescription: {
    maxWidth: '650px',
    margin: '0 auto',
    color: '#8996a8',
    fontSize: '17px',
    lineHeight: 1.7,
  },

  howSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '70px 6% 110px',
  },

  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '50px',
  },

  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '18px',
  },

  stepCard: {
    position: 'relative' as const,
    padding: '28px',
    minHeight: '240px',
    background: '#0a1422',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
  },

  stepNumber: {
    position: 'absolute' as const,
    top: '20px',
    right: '22px',
    color: 'rgba(255,255,255,0.18)',
    fontSize: '13px',
    fontWeight: 800,
  },

  stepIcon: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    background: 'rgba(40,169,255,0.1)',
    fontSize: '22px',
    marginBottom: '25px',
  },

  stepTitle: {
    margin: 0,
    fontSize: '19px',
  },

  stepText: {
    color: '#8996a8',
    lineHeight: 1.6,
    fontSize: '14px',
  },

  featuresSection: {
    background: '#07101c',
    padding: '100px 6%',
  },

  featureGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },

  largeFeatureCard: {
    padding: '34px',
    background: '#0b1726',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
  },

  featureIcon: {
    fontSize: '30px',
    marginBottom: '22px',
  },

  featureTitle: {
    margin: '0 0 12px',
    fontSize: '23px',
  },

  featureText: {
    color: '#8e9bad',
    lineHeight: 1.7,
    fontSize: '15px',
  },

  featureLink: {
    display: 'inline-block',
    marginTop: '18px',
    color: '#28a9ff',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px',
  },

  ctaSection: {
    textAlign: 'center' as const,
    padding: '120px 6%',
    background:
      'radial-gradient(circle at center, rgba(22,135,248,0.14), transparent 50%)',
  },

  ctaTitle: {
    margin: '15px 0',
    fontSize: 'clamp(40px, 6vw, 65px)',
    lineHeight: 1.05,
    letterSpacing: '-2px',
  },

  ctaText: {
    maxWidth: '500px',
    margin: '0 auto 30px',
    color: '#8996a8',
    lineHeight: 1.7,
  },

  footer: {
    padding: '40px 6%',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap' as const,
  },

  footerLogo: {
    fontSize: '20px',
    fontWeight: 800,
  },

  footerText: {
    color: '#687589',
    fontSize: '13px',
    marginTop: '8px',
  },

  footerCopyright: {
    color: '#687589',
    fontSize: '13px',
  },
};