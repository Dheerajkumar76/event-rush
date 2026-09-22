'use client';

import React from 'react';
import QRCode from 'react-qr-code';

type ReservationQRCodeProps = {
  code: string;
  eventTitle: string;
  attendeeName: string;
};

export default function ReservationQRCode({
  code,
  eventTitle,
  attendeeName,
}: ReservationQRCodeProps) {
  if (!code) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-white p-4">
          <QRCode
            value={code}
            size={220}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{eventTitle}</h3>
          <p className="text-sm text-gray-600">{attendeeName}</p>
        </div>
      </div>
    </div>
  );
}
