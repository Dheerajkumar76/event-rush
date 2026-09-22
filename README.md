# Event Rush

### Smart Event Parking & QR-Based Entry Management Platform

Event Rush is a full-stack web application designed to simplify parking management and entry verification for large events.

It allows attendees to reserve parking spaces and arrival slots before reaching an event, receive a secure QR pass, and use that pass for quick entry verification.

Organizers can manage events, venues, parking zones, arrival slots, and reservations, while security teams can verify QR passes at event entrances.

---

## 🚀 Live Demo

**Live Application:**  
https://event-rush-two.vercel.app

**GitHub Repository:**  
https://github.com/Dheerajkumar76/event-rush

---

## 📌 Features

### 👤 Attendee

- Create an attendee account
- Browse available events
- Reserve event parking
- Select parking zones
- Select arrival slots
- View active and past reservations
- View parking pass
- Generate and display QR code
- Cancel reservations
- Prevent duplicate active reservations

### 🏢 Organizer

- Create and manage events
- Manage event venues
- Configure parking zones
- Configure arrival slots
- View event reservations
- Monitor reservation statistics
- Publish and cancel events
- Manage event parking capacity

### 🛡️ Security

- Dedicated security login
- QR-based reservation verification
- Manual QR token entry
- Validate reservation status
- Prevent duplicate check-ins
- Record check-in time
- Record the security user who performed the check-in
- Maintain check-in audit logs

### 👑 Admin

- Admin dashboard
- Create users with different roles
- Manage users
- View events
- View reservations
- View check-in records
- Role-based access control

---

## 🔄 How It Works

```text
                    EVENT RUSH
                        │
                        ▼
                ┌───────────────┐
                │ Select Event  │
                └───────┬───────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Select Parking    │
              │ Zone & Arrival    │
              │ Slot              │
              └─────────┬─────────┘
                        │
                        ▼
                ┌───────────────┐
                │ Reservation   │
                │ Created       │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ QR Parking    │
                │ Pass          │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Event Entry   │
                │ QR Scan       │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Check-In      │
                │ Recorded      │
                └───────────────┘
