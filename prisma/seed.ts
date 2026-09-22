import 'dotenv/config';
import {
  PrismaClient,
  UserRole,
  EventStatus,
  ParkingZoneType,
  ReservationStatus,
  CheckInStatus,
  VehicleType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function reservationCode(index: number) {
  return `ER-${String(100000 + index)}`;
}

function qrToken(index: number) {
  return `QR-DEMO-${index}-${crypto.randomUUID()}`;
}

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  await prisma.checkInLog.deleteMany();
  await prisma.qRPass.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.arrivalSlot.deleteMany();
  await prisma.eventParkingZone.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.parkingZone.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Aarav Mehta',
        email: 'admin@eventrush.com',
        passwordHash,
        role: UserRole.ADMIN,
        phone: '9000000001',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Nisha Verma',
        email: 'organizer1@eventrush.com',
        passwordHash,
        role: UserRole.ORGANIZER,
        phone: '9000000002',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Karthik Raman',
        email: 'organizer2@eventrush.com',
        passwordHash,
        role: UserRole.ORGANIZER,
        phone: '9000000003',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rohit Saini',
        email: 'security1@eventrush.com',
        passwordHash,
        role: UserRole.SECURITY,
        phone: '9000000004',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Das',
        email: 'security2@eventrush.com',
        passwordHash,
        role: UserRole.SECURITY,
        phone: '9000000005',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Demo Attendee',
        email: 'attendee@eventrush.com',
        passwordHash,
        role: UserRole.ATTENDEE,
        phone: '9123456780',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ananya Sharma',
        email: 'ananya@eventrush.com',
        passwordHash,
        role: UserRole.ATTENDEE,
        phone: '9000000011',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Vikram Iyer',
        email: 'vikram@eventrush.com',
        passwordHash,
        role: UserRole.ATTENDEE,
        phone: '9000000012',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sneha Kapoor',
        email: 'sneha@eventrush.com',
        passwordHash,
        role: UserRole.ATTENDEE,
        phone: '9000000013',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rahul Nair',
        email: 'rahul@eventrush.com',
        passwordHash,
        role: UserRole.ATTENDEE,
        phone: '9000000014',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ishita Sen',
        email: 'ishita@eventrush.com',
        passwordHash,
        role: UserRole.ATTENDEE,
        phone: '9000000015',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Manoj Patel',
        email: 'manoj@eventrush.com',
        passwordHash,
        role: UserRole.ATTENDEE,
        phone: '9000000016',
      },
    }),
  ]);

  const admin = users.find((u) => u.role === UserRole.ADMIN)!;
  const organizers = users.filter((u) => u.role === UserRole.ORGANIZER);
  const securityUsers = users.filter((u) => u.role === UserRole.SECURITY);
  const attendees = users.filter((u) => u.role === UserRole.ATTENDEE);

  const venues = await Promise.all([
    prisma.venue.create({
      data: {
        name: 'Bangalore International Expo Center',
        address: '12 Tech Park Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        organizerId: organizers[0].id,
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Chennai Trade Arena',
        address: '45 Marina Link Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600002',
        organizerId: organizers[1].id,
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Hyderabad Convention Grounds',
        address: '88 Innovation Avenue',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        organizerId: organizers[0].id,
      },
    }),
  ]);

  const eventDates = [
    new Date('2026-07-15T10:00:00.000Z'),
    new Date('2026-08-05T09:30:00.000Z'),
    new Date('2026-08-20T11:00:00.000Z'),
    new Date('2026-09-10T08:30:00.000Z'),
  ];

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Auto Expo Priority Parking Demo',
        description: 'Live demo for smart entry and zone-based parking allocation.',
        eventDate: eventDates[0],
        status: EventStatus.PUBLISHED,
        organizerId: organizers[0].id,
        venueId: venues[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Tech Summit India 2026',
        description: 'Large-scale technology conference with segmented parking operations.',
        eventDate: eventDates[1],
        status: EventStatus.PUBLISHED,
        organizerId: organizers[0].id,
        venueId: venues[2].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Startup Connect Chennai',
        description: 'Networking event for founders, investors, and early-stage teams.',
        eventDate: eventDates[2],
        status: EventStatus.PUBLISHED,
        organizerId: organizers[1].id,
        venueId: venues[1].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'EV Mobility Leadership Forum',
        description: 'Forum focused on electric mobility leaders and ecosystem partners.',
        eventDate: eventDates[3],
        status: EventStatus.DRAFT,
        organizerId: organizers[1].id,
        venueId: venues[0].id,
      },
    }),
  ]);

  const zoneSeed = [
    { name: 'VIP Zone A', type: ParkingZoneType.VIP, capacity: 80 },
    { name: 'General Zone B', type: ParkingZoneType.GENERAL, capacity: 180 },
    { name: 'Staff Zone C', type: ParkingZoneType.STAFF, capacity: 60 },
    { name: 'Accessible Zone D', type: ParkingZoneType.DISABLED, capacity: 30 },
  ];

  const allZones = [];
  for (const venue of venues) {
    for (const zone of zoneSeed) {
      const createdZone = await prisma.parkingZone.create({
        data: {
          name: `${zone.name} - ${venue.city}`,
          type: zone.type,
          capacity: zone.capacity,
          venueId: venue.id,
        },
      });
      allZones.push(createdZone);
    }
  }

  for (const event of events) {
    const eventVenue = venues.find((v) => v.id === event.venueId)!;
    const venueZones = allZones.filter((zone) => zone.venueId === eventVenue.id);

    for (const zone of venueZones) {
      await prisma.eventParkingZone.create({
        data: {
          eventId: event.id,
          zoneId: zone.id,
        },
      });
    }
  }

  const allSlots = [];
  for (const event of events) {
    const base = new Date(event.eventDate);
    const slotHours = [-2, -1, 0, 1];

    for (let i = 0; i < slotHours.length; i++) {
      const slot = await prisma.arrivalSlot.create({
        data: {
          eventId: event.id,
          slotTime: addHours(base, slotHours[i]),
          maxEntries: 80 + i * 20,
        },
      });
      allSlots.push(slot);
    }
  }

  const vehiclePool: { number: string; type: VehicleType }[] = [
    { number: 'TN 03 AQ 1234', type: VehicleType.CAR },
    { number: 'KA 01 MW 3087', type: VehicleType.CAR },
    { number: 'TS 09 HH 7788', type: VehicleType.SUV },
    { number: 'MH 12 RT 4567', type: VehicleType.BIKE },
    { number: 'DL 05 PQ 2211', type: VehicleType.VAN },
    { number: 'AP 16 AB 9087', type: VehicleType.CAR },
    { number: 'KL 07 TT 3901', type: VehicleType.BIKE },
    { number: 'TN 10 CC 6632', type: VehicleType.SUV },
    { number: 'KA 19 VV 4400', type: VehicleType.CAR },
    { number: 'TS 08 ML 1209', type: VehicleType.BUS },
  ];

  let reservationIndex = 1;
  const createdReservations = [];

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];

    for (let j = 0; j < 2; j++) {
      const event = events[(i + j) % 3];
      const eventVenue = venues.find((v) => v.id === event.venueId)!;
      const matchingZones = allZones.filter((zone) => zone.venueId === eventVenue.id);
      const matchingSlots = allSlots.filter((slot) => slot.eventId === event.id);
      const vehicle = vehiclePool[(i + j) % vehiclePool.length];
      const status =
        reservationIndex % 5 === 0
          ? ReservationStatus.CHECKED_IN
          : reservationIndex % 7 === 0
          ? ReservationStatus.PENDING
          : ReservationStatus.CONFIRMED;

      const reservation = await prisma.reservation.create({
        data: {
          code: reservationCode(reservationIndex),
          userId: attendee.id,
          eventId: event.id,
          parkingZoneId: matchingZones[(i + j) % matchingZones.length]?.id,
          slotId: matchingSlots[(i + j) % matchingSlots.length]?.id,
          vehicleNumber: vehicle.number,
          vehicleType: vehicle.type,
          status,
        },
      });

      await prisma.qRPass.create({
        data: {
          reservationId: reservation.id,
          qrToken: qrToken(reservationIndex),
        },
      });

      if (status === ReservationStatus.CHECKED_IN) {
        await prisma.checkInLog.create({
          data: {
            reservationId: reservation.id,
            scannedBy: securityUsers[reservationIndex % securityUsers.length].id,
            status: CheckInStatus.SUCCESS,
          },
        });
      }

      createdReservations.push(reservation);
      reservationIndex++;
    }
  }

  for (const attendee of attendees) {
    await prisma.notification.createMany({
      data: [
        {
          userId: attendee.id,
          title: 'Reservation update',
          message: 'Your parking reservation details are ready for the upcoming event.',
          isRead: false,
        },
        {
          userId: attendee.id,
          title: 'Arrival reminder',
          message: 'Please arrive within your selected slot for faster entry.',
          isRead: attendee.email.includes('demo') ? false : true,
        },
      ],
    });
  }

  for (const event of events) {
    await prisma.auditLog.createMany({
      data: [
        {
          userId: event.organizerId,
          eventId: event.id,
          action: 'EVENT_CREATED',
          resourceType: 'Event',
          resourceId: event.id,
          meta: {
            title: event.title,
            status: event.status,
          },
        },
        {
          userId: admin.id,
          eventId: event.id,
          action: 'EVENT_REVIEWED',
          resourceType: 'Event',
          resourceId: event.id,
          meta: {
            reviewedBy: admin.email,
          },
        },
      ],
    });
  }

  console.log('✅ Database seeded successfully');
  console.log(`Users: ${users.length}`);
  console.log(`Venues: ${venues.length}`);
  console.log(`Events: ${events.length}`);
  console.log(`Parking Zones: ${allZones.length}`);
  console.log(`Arrival Slots: ${allSlots.length}`);
  console.log(`Reservations: ${createdReservations.length}`);
  console.log('');
  console.log('Demo login password for all users: demo123');
  console.log('Organizer: organizer1@eventrush.com');
  console.log('Security: security1@eventrush.com');
  console.log('Attendee: attendee@eventrush.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });