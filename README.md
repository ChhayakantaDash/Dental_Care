# Dental Clinic - Appointment & Patient Management System

A full-stack clinic management application built with Next.js 16, featuring role-based dashboards for Patients, Doctors, and Administrators. The system handles appointment booking, QR-based payment verification, prescriptions, medical records, and complete clinic administration.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 with @prisma/adapter-neon |
| Auth | JWT (jose) with HTTP-only cookies |
| Styling | Tailwind CSS v4 |
| Validation | Zod v4 |
| File Uploads | Cloudinary |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## Features

### Public Site
- Homepage with hero section, features overview, doctor listings, gallery, and contact info
- Public doctors page with specializations and availability
- Patient registration and login

### Patient Dashboard (Blue Theme)
- Overview with stats (appointments, upcoming, records, total spent)
- **3-step appointment booking**: select doctor → pick date → choose time slot
- View all appointments with status tracking
- **QR-based payment**: 15-minute payment window, UPI QR display, UTR number input, screenshot upload
- Medical records with prescriptions and downloadable attachments

### Doctor Dashboard (Green Theme)
- Today's overview with patient count and appointment stats
- Appointment management (mark Arrived, Complete, No Show)
- **Prescription system**: diagnosis, multiple medications (name, dosage, frequency, duration), instructions
- Schedule management (set availability per day of week)

### Admin Dashboard (Dark Slate Theme)
- System overview (patients, doctors, appointments, revenue, pending payments)
- **Doctor management**: add/edit/remove doctors with credentials
- **Payment verification**: view submitted screenshots, approve/reject with reasons
- **Patient management**: view all patients, ban/unban accounts
- **Gallery management**: upload/delete clinic images with categories
- **Clinic settings**: name, address, phone, email, UPI ID, about text
- **Image uploads**: logo, QR code, hero image via Cloudinary
- **Holiday management**: add/remove clinic holidays

---

## Project Structure

```
dental/
├── app/
│   ├── api/
│   │   ├── public/doctors/route.ts    # Public doctors API
│   │   └── seed/route.ts             # Admin seed endpoint
│   ├── admin/                        # Admin dashboard pages
│   │   ├── appointments/
│   │   ├── doctors/
│   │   ├── gallery/
│   │   ├── patients/
│   │   ├── payments/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── doctor/                       # Doctor dashboard pages
│   │   ├── appointments/
│   │   ├── schedule/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── patient/                      # Patient dashboard pages
│   │   ├── appointments/
│   │   ├── book/
│   │   ├── records/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── doctors/page.tsx              # Public doctors listing
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── generated/prisma/            # Prisma generated client
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Homepage
├── components/
│   ├── admin/                        # Admin-specific components
│   ├── doctor/                       # Doctor-specific components
│   ├── patient/                      # Patient-specific components
│   └── ui/                           # Shared UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── textarea.tsx
├── lib/
│   ├── actions/                      # Server Actions
│   │   ├── admin.ts
│   │   ├── appointments.ts
│   │   ├── auth.ts
│   │   ├── payments.ts
│   │   └── prescriptions.ts
│   ├── auth.ts                       # Session management
│   ├── cloudinary.ts                 # Image upload/delete
│   ├── jwt.ts                        # JWT create/verify (Edge-compatible)
│   ├── prisma.ts                     # Prisma singleton
│   ├── utils.ts                      # Helpers (cn, formatDate, etc.)
│   └── validations.ts               # Zod schemas
├── prisma/
│   ├── migrations/
│   └── schema.prisma                 # Database schema
├── types/index.ts                    # Shared types
├── middleware.ts                      # RBAC route protection
└── prisma.config.ts                  # Prisma datasource config
```

---

## Database Schema

### Models
- **User** — id, name, email, password, phone, role, isActive, avatar
- **Doctor** — specialization, qualification, experience, consultationFee, bio, profileImage
- **DoctorAvailability** — dayOfWeek, startTime, endTime, slotDuration, isActive
- **Appointment** — patientId, doctorId, date, startTime, endTime, status, notes
- **Payment** — appointmentId, amount, status, utrNumber, screenshotUrl, expiresAt, verifiedBy, rejectionReason
- **Prescription** — appointmentId, doctorId, diagnosis, medications (JSON), instructions
- **MedicalRecord** — patientId, visitDate, doctorName, diagnosis, prescription, notes, attachments
- **ClinicSettings** — clinicName, address, phone, email, logo, qrCodeUrl, heroImage, upiId, about
- **Holiday** — date, reason
- **GalleryImage** — url, publicId, caption, category

### Enums
- **Role**: PATIENT, DOCTOR, ADMIN
- **AppointmentStatus**: PENDING_PAYMENT, PAYMENT_SUBMITTED, CONFIRMED, ARRIVED, COMPLETED, CANCELLED, NO_SHOW, EXPIRED
- **PaymentStatus**: PENDING, VERIFIED, REJECTED, EXPIRED

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Cloudinary account

### 1. Install Dependencies

```bash
cd dental
npm install
```

### 2. Environment Variables

Create a `.env` file in the `dental/` directory:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="your-secure-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Seed Admin User

Start the dev server, then make a POST request to create the initial admin account:

```bash
curl -X POST http://localhost:3000/api/seed
```

Default admin credentials:
- **Email**: admin@clinic.com
- **Password**: admin123

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## User Flows

### Patient Flow
1. Register → Login → Dashboard
2. Book Appointment → Select Doctor → Pick Date → Choose Slot
3. Pay via UPI → Enter UTR + Upload Screenshot (15-min window)
4. Admin verifies payment → Appointment confirmed
5. Visit clinic → Doctor marks Arrived → Completed
6. View prescriptions and medical records

### Doctor Flow
1. Login → Dashboard (today's appointments)
2. Mark patient as Arrived / Completed / No Show
3. Write prescriptions with medications
4. Manage weekly schedule (availability per day)

### Admin Flow
1. Login → Dashboard (overview stats)
2. Add/manage doctors and their credentials
3. Verify submitted payments (approve/reject)
4. Manage patients (ban/unban)
5. Upload gallery images, clinic logo, QR code, hero image
6. Configure clinic settings and holidays

---

## Authentication & Authorization

- JWT tokens stored in HTTP-only cookies (7-day expiry)
- Middleware-based route protection with role checks
- Edge-compatible JWT verification (jose library)
- Server Actions validate auth before every mutation
- Inactive users are blocked at the `requireAuth` level

---

## Payment System

The system uses **manual QR-based payment verification** (no payment gateway):

1. Patient books an appointment → Payment record created with 15-minute expiry
2. Patient sees clinic UPI QR code, makes payment externally
3. Patient enters UTR number and optionally uploads payment screenshot
4. Admin reviews the payment submission
5. Admin approves → appointment confirmed, or rejects → appointment cancelled

---

## Build

```bash
npm run build
```

---

## License

Private project — all rights reserved.
#   D e n t a l _ C a r e  
 