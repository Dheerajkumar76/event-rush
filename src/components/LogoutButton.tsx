'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{
        padding: '11px 19px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.16)',
        background: '#0b1726',
        color: '#aeb8c7',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      Logout
    </button>
  );
}