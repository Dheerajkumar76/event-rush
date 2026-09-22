'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/login');
    } catch {
      setError('Unable to connect to the registration service.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050b14',
        color: '#f5f7fb',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          height: '76px',
          padding: '0 6%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          background: 'rgba(5, 11, 20, 0.94)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '22px',
            fontWeight: 800,
          }}
        >
          <span
            style={{
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
            }}
          >
            P
          </span>

          <span>
            Event <span style={{ color: '#28a9ff' }}>Rush</span>
          </span>
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            style={{
              color: '#aeb8c7',
              fontSize: '14px',
            }}
          >
            Already have an account?
          </span>

          <Link
            href="/login"
            style={{
              padding: '10px 18px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Registration Section */}
      <section
        style={{
          minHeight: 'calc(100vh - 76px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 20px',
          background:
            'radial-gradient(circle at center, rgba(22,135,248,0.12), transparent 45%)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
          }}
        >
          {/* Heading */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#28a9ff',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '2px',
              }}
            >
              EVENT RUSH
            </p>

            <h1
              style={{
                margin: '12px 0 10px',
                fontSize: '38px',
                lineHeight: 1.1,
                letterSpacing: '-1px',
              }}
            >
              Create your account
            </h1>

            <p
              style={{
                margin: 0,
                color: '#8996a8',
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              Create your attendee account and start planning
              your event parking.
            </p>
          </div>

          {/* Form Card */}
          <div
            style={{
              padding: '32px',
              background: '#0a1422',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'grid',
                gap: '18px',
              }}
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '13px 14px',
                    border: '1px solid #26364a',
                    borderRadius: '10px',
                    background: '#050b14',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '13px 14px',
                    border: '1px solid #26364a',
                    borderRadius: '10px',
                    background: '#050b14',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="text"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '13px 14px',
                    border: '1px solid #26364a',
                    borderRadius: '10px',
                    background: '#050b14',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '13px 14px',
                    border: '1px solid #26364a',
                    borderRadius: '10px',
                    background: '#050b14',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(248,113,113,0.3)',
                    background: 'rgba(127,29,29,0.25)',
                    color: '#fca5a5',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '4px',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '11px',
                  background: '#1687f8',
                  color: '#ffffff',
                  cursor: loading
                    ? 'not-allowed'
                    : 'pointer',
                  fontSize: '15px',
                  fontWeight: 700,
                  opacity: loading ? 0.7 : 1,
                  boxShadow:
                    '0 12px 35px rgba(22,135,248,0.25)',
                }}
              >
                {loading
                  ? 'Creating account...'
                  : 'Create Account'}
              </button>
            </form>

            <div
              style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  color: '#8996a8',
                  fontSize: '14px',
                }}
              >
                Already registered?{' '}
              </span>

              <Link
                href="/login"
                style={{
                  color: '#28a9ff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                Login here
              </Link>
            </div>
          </div>

          {/* Account Type Note */}
          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              color: '#687589',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          >
            Public registration creates an attendee account.
            Organizer, security, and admin accounts are created
            by an authorized administrator.
          </p>
        </div>
      </section>
    </main>
  );
}