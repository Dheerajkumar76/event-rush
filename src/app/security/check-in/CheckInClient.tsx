'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

type Result = {
  message?: string;
  error?: string;
  data?: {
    reservationCode: string;
    attendeeName: string;
    eventTitle: string;
    eventDate: string;
    vehicleNumber: string;
    vehicleType: string;
    parkingZone: string | null;
    arrivalSlot: string | null;
    checkedInAt: string;
  };
};

export default function CheckInClient() {
  const [token, setToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(qrToken: string) {
    if (!qrToken.trim() || submitting) return;

    setSubmitting(true);
    setResult(null);
    setScanning(false);

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrToken: qrToken.trim(),
        }),
      });

      setResult(await response.json());
    } catch {
      setResult({
        error: 'Unable to reach the check-in service.',
      });
    } finally {
      setSubmitting(false);
    }
  }

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
          <span style={styles.securityBadge}>
            SECURITY
          </span>

          <LogoutButton />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>
            EVENT RUSH · SECURITY
          </span>

          <h1 style={styles.heading}>
            Check-In
          </h1>

          <p style={styles.subtext}>
            Verify attendee parking passes quickly and securely
            at the event entrance.
          </p>
        </div>

        <div style={styles.grid}>
          {/* SCANNER CARD */}
          <section style={styles.scannerCard}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Scan Parking Pass
                </h2>

                <p style={styles.cardDescription}>
                  Use the camera to scan the attendee&apos;s QR
                  code.
                </p>
              </div>

              <div style={styles.scanIcon}>
                QR
              </div>
            </div>

            {!scanning ? (
              <div style={styles.scannerPlaceholder}>
                <div style={styles.qrFrame}>
                  <div style={styles.qrCornerTopLeft} />
                  <div style={styles.qrCornerTopRight} />
                  <div style={styles.qrCornerBottomLeft} />
                  <div style={styles.qrCornerBottomRight} />

                  <div style={styles.qrCenter}>
                    <span>QR</span>
                  </div>
                </div>

                <h3 style={styles.placeholderTitle}>
                  Ready to scan
                </h3>

                <p style={styles.placeholderText}>
                  Position the attendee&apos;s QR pass inside
                  the scanner frame.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setScanning(true);
                  }}
                  style={styles.scanButton}
                >
                  Open Camera Scanner
                </button>
              </div>
            ) : (
              <div style={styles.cameraContainer}>
                <Scanner
                  onScan={(codes) => {
                    const value = codes[0]?.rawValue?.trim();

                    if (value) {
                      setToken(value);
                      void submit(value);
                    }
                  }}
                  onError={() =>
                    setResult({
                      error:
                        'Camera access failed. Check browser permissions.',
                    })
                  }
                  constraints={{
                    facingMode: 'environment',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setScanning(false)}
                  style={styles.closeScannerButton}
                >
                  Close Scanner
                </button>
              </div>
            )}

            {/* MANUAL ENTRY */}
            <div style={styles.divider}>
              <span>OR ENTER QR VALUE MANUALLY</span>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void submit(token);
              }}
              style={styles.form}
            >
              <label
                htmlFor="qrToken"
                style={styles.label}
              >
                QR Token
              </label>

              <div style={styles.inputRow}>
                <input
                  id="qrToken"
                  value={token}
                  onChange={(event) =>
                    setToken(event.target.value)
                  }
                  required
                  placeholder="Enter QR value"
                  style={styles.input}
                />

                <button
                  disabled={submitting}
                  type="submit"
                  style={{
                    ...styles.checkButton,
                    ...(submitting
                      ? styles.disabledButton
                      : {}),
                  }}
                >
                  {submitting ? 'Checking...' : 'Check In'}
                </button>
              </div>
            </form>
          </section>

          {/* RESULT CARD */}
          <section style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div>
                <span style={styles.resultLabel}>
                  VERIFICATION
                </span>

                <h2 style={styles.resultTitle}>
                  Check-In Result
                </h2>
              </div>
            </div>

            {!result && (
              <div style={styles.emptyResult}>
                <div style={styles.emptyResultIcon}>
                  ✓
                </div>

                <h3 style={styles.emptyResultTitle}>
                  Waiting for a pass
                </h3>

                <p style={styles.emptyResultText}>
                  Scan an attendee QR code to verify their
                  reservation and display their entry details.
                </p>
              </div>
            )}

            {result?.error && (
              <div style={styles.errorResult}>
                <div style={styles.errorIcon}>!</div>

                <h3 style={styles.errorTitle}>
                  Check-In Failed
                </h3>

                <p style={styles.errorText}>
                  {result.error}
                </p>
              </div>
            )}

            {result?.data && (
              <div style={styles.successResult}>
                <div style={styles.successTop}>
                  <div style={styles.successIcon}>
                    ✓
                  </div>

                  <div>
                    <span style={styles.successLabel}>
                      ENTRY VERIFIED
                    </span>

                    <h3 style={styles.successTitle}>
                      {result.message}
                    </h3>
                  </div>
                </div>

                <div style={styles.attendeeBox}>
                  <span style={styles.smallLabel}>
                    ATTENDEE
                  </span>

                  <strong style={styles.attendeeName}>
                    {result.data.attendeeName}
                  </strong>
                </div>

                <div style={styles.infoList}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      EVENT
                    </span>

                    <span style={styles.infoValue}>
                      {result.data.eventTitle}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      DATE
                    </span>

                    <span style={styles.infoValue}>
                      {new Date(
                        result.data.eventDate
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      VEHICLE
                    </span>

                    <span style={styles.infoValue}>
                      {result.data.vehicleType}{' '}
                      · {result.data.vehicleNumber}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      PARKING
                    </span>

                    <span style={styles.infoValue}>
                      {result.data.parkingZone ??
                        'Not assigned'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      ARRIVAL
                    </span>

                    <span style={styles.infoValue}>
                      {result.data.arrivalSlot
                        ? new Date(
                            result.data.arrivalSlot
                          ).toLocaleString()
                        : 'Not assigned'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      RESERVATION
                    </span>

                    <span style={styles.infoValue}>
                      {result.data.reservationCode}
                    </span>
                  </div>
                </div>

                <div style={styles.checkedInNotice}>
                  ✓ Check-in recorded successfully
                </div>
              </div>
            )}
          </section>
        </div>
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
    alignItems: 'center',
    gap: '10px',
  },

  securityBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(40,169,255,0.08)',
    border: '1px solid rgba(40,169,255,0.25)',
    color: '#54b7ff',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1px',
  },

  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px 80px',
  },

  header: {
    marginBottom: '36px',
  },

  eyebrow: {
    color: '#28a9ff',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '2.5px',
  },

  heading: {
    margin: '12px 0 8px',
    fontSize: '52px',
    lineHeight: 1.05,
    letterSpacing: '-1.5px',
  },

  subtext: {
    margin: 0,
    color: '#8fa4bf',
    fontSize: '17px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 0.85fr)',
    gap: '22px',
    alignItems: 'stretch',
  },

  scannerCard: {
    padding: '28px',
    borderRadius: '20px',
    border: '1px solid #24344a',
    background: '#0d1727',
    boxShadow: '0 18px 50px rgba(0,0,0,0.2)',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '24px',
  },

  cardTitle: {
    margin: 0,
    fontSize: '22px',
  },

  cardDescription: {
    margin: '7px 0 0',
    color: '#8093ab',
    fontSize: '14px',
    lineHeight: 1.5,
  },

  scanIcon: {
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'rgba(40,169,255,0.1)',
    border: '1px solid rgba(40,169,255,0.2)',
    color: '#28a9ff',
    fontSize: '11px',
    fontWeight: 800,
  },

  scannerPlaceholder: {
    minHeight: '390px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    borderRadius: '16px',
    background: '#07101e',
    border: '1px solid #1c2b40',
    textAlign: 'center',
  },

  qrFrame: {
    position: 'relative',
    width: '190px',
    height: '190px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },

  qrCenter: {
    width: '90px',
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'rgba(40,169,255,0.08)',
    border: '1px dashed rgba(40,169,255,0.4)',
    color: '#28a9ff',
    fontSize: '18px',
    fontWeight: 800,
  },

  qrCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '42px',
    height: '42px',
    borderTop: '3px solid #28a9ff',
    borderLeft: '3px solid #28a9ff',
    borderRadius: '8px 0 0 0',
  },

  qrCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '42px',
    height: '42px',
    borderTop: '3px solid #28a9ff',
    borderRight: '3px solid #28a9ff',
    borderRadius: '0 8px 0 0',
  },

  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '42px',
    height: '42px',
    borderBottom: '3px solid #28a9ff',
    borderLeft: '3px solid #28a9ff',
    borderRadius: '0 0 0 8px',
  },

  qrCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '42px',
    height: '42px',
    borderBottom: '3px solid #28a9ff',
    borderRight: '3px solid #28a9ff',
    borderRadius: '0 0 8px 0',
  },

  placeholderTitle: {
    margin: '0 0 7px',
    fontSize: '20px',
  },

  placeholderText: {
    maxWidth: '360px',
    margin: '0 0 22px',
    color: '#8093ab',
    lineHeight: 1.6,
    fontSize: '14px',
  },

  scanButton: {
    padding: '13px 20px',
    border: 'none',
    borderRadius: '10px',
    background: '#1687f8',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(22,135,248,0.2)',
  },

  cameraContainer: {
    padding: '12px',
    borderRadius: '16px',
    background: '#050b14',
    border: '1px solid #1c2b40',
    overflow: 'hidden',
  },

  closeScannerButton: {
    width: '100%',
    marginTop: '12px',
    padding: '11px',
    borderRadius: '9px',
    border: '1px solid #334155',
    background: '#0b1726',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 600,
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0 18px',
    color: '#52657c',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1px',
  },

  form: {
    display: 'grid',
    gap: '8px',
  },

  label: {
    color: '#aebdd0',
    fontSize: '12px',
    fontWeight: 700,
  },

  inputRow: {
    display: 'flex',
    gap: '10px',
  },

  input: {
    flex: 1,
    minWidth: 0,
    padding: '13px 14px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: '#07101e',
    color: '#f5f7fb',
    fontSize: '14px',
    outline: 'none',
  },

  checkButton: {
    padding: '13px 18px',
    borderRadius: '10px',
    border: 'none',
    background: '#1687f8',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  resultCard: {
    padding: '28px',
    borderRadius: '20px',
    border: '1px solid #24344a',
    background: '#0d1727',
    boxShadow: '0 18px 50px rgba(0,0,0,0.2)',
  },

  resultHeader: {
    marginBottom: '24px',
  },

  resultLabel: {
    color: '#28a9ff',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '2px',
  },

  resultTitle: {
    margin: '8px 0 0',
    fontSize: '22px',
  },

  emptyResult: {
    minHeight: '390px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '30px',
    borderRadius: '16px',
    background: '#07101e',
    border: '1px solid #1c2b40',
  },

  emptyResultIcon: {
    width: '58px',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'rgba(40,169,255,0.08)',
    border: '1px solid rgba(40,169,255,0.25)',
    color: '#28a9ff',
    fontSize: '22px',
    marginBottom: '18px',
  },

  emptyResultTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
  },

  emptyResultText: {
    maxWidth: '330px',
    margin: 0,
    color: '#8093ab',
    fontSize: '14px',
    lineHeight: 1.6,
  },

  successResult: {
    padding: '20px',
    borderRadius: '16px',
    background: 'rgba(16,185,129,0.05)',
    border: '1px solid rgba(16,185,129,0.25)',
  },

  successTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '22px',
  },

  successIcon: {
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: '#10b981',
    color: '#ffffff',
    fontSize: '21px',
    fontWeight: 800,
  },

  successLabel: {
    color: '#6ee7b7',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1.5px',
  },

  successTitle: {
    margin: '5px 0 0',
    fontSize: '19px',
  },

  attendeeBox: {
    padding: '15px',
    marginBottom: '18px',
    borderRadius: '11px',
    background: '#0a1624',
    border: '1px solid #20334a',
  },

  smallLabel: {
    display: 'block',
    color: '#607894',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1px',
    marginBottom: '5px',
  },

  attendeeName: {
    fontSize: '18px',
  },

  infoList: {
    display: 'grid',
    gap: '12px',
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  infoLabel: {
    color: '#607894',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1px',
  },

  infoValue: {
    color: '#d6e0ec',
    fontSize: '13px',
    textAlign: 'right',
  },

  checkedInNotice: {
    marginTop: '18px',
    padding: '12px',
    borderRadius: '9px',
    background: 'rgba(16,185,129,0.1)',
    color: '#6ee7b7',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 700,
  },

  errorResult: {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    borderRadius: '16px',
    background: 'rgba(239,68,68,0.05)',
    border: '1px solid rgba(239,68,68,0.25)',
    textAlign: 'center',
  },

  errorIcon: {
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    fontSize: '24px',
    fontWeight: 800,
    marginBottom: '16px',
  },

  errorTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    color: '#fca5a5',
  },

  errorText: {
    maxWidth: '320px',
    margin: 0,
    color: '#b9a1a1',
    lineHeight: 1.6,
    fontSize: '14px',
  },
};