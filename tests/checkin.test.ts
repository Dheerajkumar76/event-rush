import assert from 'node:assert/strict';
import test from 'node:test';
import { canCheckIn, getReservationCheckInError } from '../src/lib/checkin';

test('only security and admin roles are authorized for check-in', () => {
  assert.equal(canCheckIn('SECURITY'), true);
  assert.equal(canCheckIn('ADMIN'), true);
  assert.equal(canCheckIn('ATTENDEE'), false);
  assert.equal(canCheckIn('ORGANIZER'), false);
});

test('a previously checked-in reservation is rejected as a duplicate', () => {
  assert.deepEqual(getReservationCheckInError('CHECKED_IN', 'PUBLISHED'), {
    message: 'Reservation has already been checked in.',
    status: 409,
    logStatus: 'DUPLICATE',
  });
});

test('only confirmed reservations are eligible for check-in', () => {
  assert.deepEqual(getReservationCheckInError('PENDING', 'PUBLISHED'), {
    message: 'Only confirmed reservations can be checked in.',
    status: 400,
    logStatus: 'DENIED',
  });
});
