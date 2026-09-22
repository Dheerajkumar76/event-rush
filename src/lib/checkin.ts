export type CheckInRole = 'SECURITY' | 'ADMIN' | 'ATTENDEE' | 'ORGANIZER' | string;

export function canCheckIn(role: CheckInRole) {
  return role === 'SECURITY' || role === 'ADMIN';
}

export function getReservationCheckInError(
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN',
  eventStatus: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'
) {
  if (eventStatus === 'CANCELLED' || eventStatus === 'COMPLETED') {
    return { message: 'This QR pass is no longer valid for check-in.', status: 400, logStatus: 'DENIED' as const };
  }

  if (status === 'CHECKED_IN') {
    return { message: 'Reservation has already been checked in.', status: 409, logStatus: 'DUPLICATE' as const };
  }

  if (status !== 'CONFIRMED') {
    return { message: 'Only confirmed reservations can be checked in.', status: 400, logStatus: 'DENIED' as const };
  }

  return null;
}
