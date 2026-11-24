# Dr. Kgomotso Mokoena — General Practitioner Pretoria
## Doctor Booking Website & Admin Management Dashboard

A full-stack, production-grade medical scheduling and practice management web application built specifically for a **General Practitioner (GP) in Pretoria, South Africa**, tailored for a practice volume of **7 to 11 patients per day** with comprehensive clinical consultation times (30 to 45 minutes).

---

### 🏥 Practice Profile (Brooklyn, Pretoria)
* **Practitioner:** Dr. Kgomotso Mokoena — `MBChB (UP), Dip Obst (SA), FCFP (SA)`
* **Specialty:** Family Medicine & General Practice
* **Accreditations:** HPCSA: `MP 0689421` | BHF Practice No: `PR 0148293`
* **Address:** Suite 402, Brooklyn Bridge Office Park, 570 Fehrsen St, Brooklyn, Pretoria, 0181
* **Consulting Hours:** Monday – Friday: 08:30 – 16:30 | Saturday: 09:00 – 12:00 | Sunday: Closed
* **Volume Promise:** Limited to 7–11 patients daily to ensure thorough examination, minimal waiting room delays, and personalized care.

---

### ✨ Features Overview

#### 1. Client-Facing Booking Experience (`/`)
* **Medical Practice Showcase:** High-trust medical hero section with clinic accreditations, services, fees, and location details.
* **4-Step Booking Wizard:**
  1. **Select Service:** General Consultation (30m, R650), Chronic Disease Review (30m, R700), Comprehensive Screening (45m, R950), Pediatric Care (30m, R620), Minor Procedures (45m, R850), Telehealth (20m, R500).
  2. **Select Date & Available Slot:** Interactive 10-day calendar displaying real-time open slots (Morning 08:30–12:30, Afternoon 14:00–16:30) and live daily capacity counter.
  3. **Patient Intake Form:** Patient details, SA ID / Passport number (POPIA compliant), medical reason for visit, and billing selector.
  4. **Medical Aid Integration:** Direct billing selection for Discovery Health, Bonitas, Momentum, GEMS, Bestmed, Medihelp, Medshield, Fedhealth, or Private (Card/Cash in practice).
  5. **Immediate Confirmation & Calendar Sync:** Unique reference code (`PRT-XXXX`), Google Calendar 1-click addition, Apple/Outlook `.ics` download, WhatsApp appointment reminder preview, and Google Maps directions link.
* **Client Booking Lookup & Self-Service Modal:** Patients can enter their `PRT-XXXX` booking reference to check status, view doctor consultation notes, or cancel their slot.

#### 2. Doctor & Staff Admin Dashboard (`/admin`)
* **Live Practice Capacity Bar:** Real-time visual capacity meter tracking today's bookings against the 7–11 patient daily limit (e.g., `8 / 10 Patients Max`).
* **KPI Metrics:** Today's Appointments, Pending Approvals, Patients Seen Today, Upcoming Next 7 Days.
* **Daily Timeline / Agenda View:**
  * Chronological slot-by-slot view of the day (08:30 to 16:15) with lunch break separation.
  * Status transition stepper: `Confirmed` ➔ `Mark Arrived` (Waiting Room) ➔ `Start Consult` (In Room) ➔ `Finish & Notes` (Completed).
  * Direct "+ Book Walk-in / Phone Patient" on any open time slot.
* **Master Appointments Table:**
  * Fast search by patient name, mobile number, SA ID number, or booking code.
  * Filter tabs: All, Confirmed, Arrived, In Room, Completed, Pending, Cancelled.
  * Quick status selector and printable schedule view.
* **Clinical Notes & Prescriptions Modal:**
  * Enter confidential doctor examination notes, diagnosis, repeat scripts, and medical certificates directly on the patient's record.
* **Reschedule Modal:**
  * Move any appointment to a new date and time with automatic slot conflict verification.
* **Walk-in & Phone-in Booking Modal:**
  * Add immediate walk-in or telephone bookings on the fly.
* **Practice Settings & Capacity Manager:**
  * Adjust daily patient limit slider (5 to 15, default 10).
  * Update clinic phone, WhatsApp line, address, and HPCSA numbers.
  * Set blocked dates (doctor leave, medical conferences, public holidays).

---

### 🚀 Running the Project

```bash
# Navigate to the project directory
cd pretoria-gp-booking

# Start development server
npm run dev

# Or build and run production server
npm run build
npm run start
```

Access the application in your browser:
* **Client Booking Portal:** `http://localhost:3005` (or default port 3000)
* **Doctor & Admin Dashboard:** `http://localhost:3005/admin`

---

### 📂 Architecture & Project Structure

```
pretoria-gp-booking/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx              # Doctor Admin Dashboard
│   │   ├── api/
│   │   │   ├── appointments/         # GET all, POST new appointment
│   │   │   │   └── [id]/             # GET single, PATCH status/notes, DELETE
│   │   │   ├── availability/         # GET daily slots & capacity status
│   │   │   ├── settings/             # GET & PATCH practice settings
│   │   │   └── stats/                # GET dashboard KPI metrics
│   │   ├── globals.css               # Tailwind styling & medical theme
│   │   ├── layout.tsx                # Metadata & root layout
│   │   └── page.tsx                  # Public Client Booking Portal
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminHeader.tsx       # Doctor bar & navigation tabs
│   │   │   ├── AppointmentsTableView.tsx # Master searchable records table
│   │   │   ├── CapacityMetrics.tsx   # 7–11 patient volume meters
│   │   │   ├── ClinicalNotesModal.tsx# Doctor diagnosis & notes recorder
│   │   │   ├── ClinicSettingsView.tsx# Practice volume & leave manager
│   │   │   ├── DailyTimelineView.tsx # Daily agenda timeline view
│   │   │   ├── RescheduleModal.tsx   # Slot conflict-checked rescheduling
│   │   │   └── WalkInBookingModal.tsx# Fast walk-in / phone booking form
│   │   ├── BookingWizard.tsx         # 4-step client booking wizard
│   │   ├── ClinicInfoFooter.tsx      # Practice hours, directions & legal
│   │   ├── DoctorBioSection.tsx      # Dr. Mokoena profile & 7–11 promise
│   │   ├── ManageBookingModal.tsx    # Patient PRT reference lookup modal
│   │   └── Navbar.tsx                # Client header with direct links
│   └── lib/
│       ├── calendar.ts               # Google Calendar & .ics file generators
│       ├── constants.ts              # SA Medical Aids & medical services
│       ├── db.ts                     # Persistent data storage & slot algorithms
│       └── types.ts                  # TypeScript clinical domain models
├── data/
│   └── clinic.json                   # Auto-persisted appointments & settings
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

### 🔒 POPIA & Medical Aid Compliance
* **POPIA Ready:** Patient personal and clinical details are kept confidential.
* **EDI Billing Ready:** Captures South African Medical Aid scheme, membership number, and dependent codes (e.g. `00`, `01`, `02`).
* **HPCSA & BHF Standards:** Displays practitioner registration numbers (`MP 0689421` / `PR 0148293`) required for diagnostic claim validity.
