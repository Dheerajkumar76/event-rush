'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError('Invalid email or password');
      return;
    }

    // Get the newly created session
    const session = await getSession();

    setLoading(false);

    if (!session?.user) {
      setError('Login failed. Please try again.');
      return;
    }

    // Redirect based on role
    switch (session.user.role) {
      case 'ADMIN':
        router.push('/admin');
        break;

      case 'ORGANIZER':
        router.push('/organizer');
        break;

      case 'SECURITY':
        router.push('/security/check-in');
        break;

      case 'ATTENDEE':
      default:
        router.push('/');
        break;
    }

    router.refresh();
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoBox}>P</span>
          <span>
            Event <strong>Rush</strong>
          </span>
        </div>

        <h1 style={styles.heading}>Welcome back.</h1>

        <p style={styles.subtext}>
          Login to continue to Event Rush.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <a href="/register" style={styles.registerLink}>
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#050b14',
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    fontFamily: 'Arial, sans-serif',
  },

  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '40px',
    borderRadius: '20px',
    border: '1px solid #1e293b',
    background: '#0b1220',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '40px',
  },

  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '2px solid #2196f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2196f3',
    fontWeight: 800,
  },

  heading: {
    margin: '0 0 8px',
    fontSize: '38px',
    letterSpacing: '-1px',
  },

  subtext: {
    margin: '0 0 30px',
    color: '#94a3b8',
    fontSize: '16px',
  },

  form: {
    display: 'grid',
    gap: '20px',
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#cbd5e1',
    fontSize: '14px',
    fontWeight: 600,
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: '#080f1c',
    color: '#f8fafc',
    fontSize: '15px',
    outline: 'none',
  },

  button: {
    padding: '14px 18px',
    borderRadius: '10px',
    border: 'none',
    background: '#2196f3',
    color: 'white',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '4px',
  },

  error: {
    margin: '0',
    color: '#f87171',
    fontSize: '14px',
  },

  registerText: {
    marginTop: '26px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },

  registerLink: {
    color: '#38a5ff',
    textDecoration: 'none',
    fontWeight: 700,
  },
};