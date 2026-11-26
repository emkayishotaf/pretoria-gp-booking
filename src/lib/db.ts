import fs from 'fs';
import path from 'path';
import { Appointment, AppointmentStatus, ClinicSettings, DashboardStats } from './types';
import { DEFAULT_CLINIC_SETTINGS, MEDICAL_SERVICES } from './constants';
import {
  isPostgresConfigured,
  initPostgresSchema,
  queryPostgres,
  mapRowToAppointment,
} from './postgres';

interface StorageData {
  settings: ClinicSettings;
  appointments: Appointment[];
}

const DATA_DIR = process.env.VERCEL ? '/tmp/clinic-data' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'clinic.json');

// Helper to format date as YYYY-MM-DD
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic seed appointments relative to today
function generateSeedAppointments(): Appointment[] {
  const today = new Date();
  const todayStr = formatDate(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);

  return [
    {
      id: 'apt-yest-01',
      reference: 'PRT-8101',
      patientName: 'Pieter van der Merwe',
      patientEmail: 'pieter.vdm@mweb.co.za',
      patientPhone: '082 441 9923',
      idNumber: '8406125089083',
      gender: 'male',
      serviceId: 'chronic-review',
      serviceName: 'Chronic Disease Review',
      serviceDuration: 30,
      servicePrice: 700,
      paymentType: 'medical_aid',
      medicalAidScheme: 'Discovery Health',
      medicalAidNumber: '928401928',
      date: yesterdayStr,
      timeSlot: '08:30',
      status: 'completed',
      reasonForVisit: 'Blood pressure routine checkup & repeat Amlodipine script renewal.',
      isFirstVisit: false,
      doctorNotes: 'BP 128/82. Well controlled. Renewed Amlodipine 5mg for 6 months.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'apt-today-01',
      reference: 'PRT-8201',
      patientName: 'Sipho Ndlovu',
      patientEmail: 'sipho.ndlovu@gmail.com',
      patientPhone: '083 234 5678',
      idNumber: '8811205128082',
      gender: 'male',
      serviceId: 'general-consult',
      serviceName: 'General Consultation',
      serviceDuration: 30,
      servicePrice: 650,
      paymentType: 'medical_aid',
      medicalAidScheme: 'Discovery Health',
      medicalAidNumber: '918273645',
      date: todayStr,
      timeSlot: '08:30',
      status: 'completed',
      reasonForVisit: 'Severe chest congestion, productive cough for 4 days, low-grade fever.',
      isFirstVisit: false,
      doctorNotes: 'Bilateral crackles at right lower base. Prescribed Azithromycin, mucolytic, and Panado. Issued 3-day sick note.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-today-02',
      reference: 'PRT-8202',
      patientName: 'Liezel Kruger',
      patientEmail: 'liezel.kruger@outlook.com',
      patientPhone: '082 918 3341',
      idNumber: '9405020149081',
      gender: 'female',
      serviceId: 'pediatric-care',
      serviceName: 'Pediatric & Child Wellness Consultation',
      serviceDuration: 30,
      servicePrice: 620,
      paymentType: 'medical_aid',
      medicalAidScheme: 'Momentum Medical Scheme',
      medicalAidNumber: '772819201',
      date: todayStr,
      timeSlot: '09:15',
      status: 'completed',
      reasonForVisit: 'Baby Liam (14 months) has acute earache and irritable through the night.',
      isFirstVisit: false,
      doctorNotes: 'Left otitis media diagnosed. Prescribed Amoxicillin suspension & Paracetamol syrup.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-today-03',
      reference: 'PRT-8203',
      patientName: 'Kagiso Molefe',
      patientEmail: 'kagiso.molefe@tuks.co.za',
      patientPhone: '076 345 9182',
      idNumber: '0102145112089',
      gender: 'female',
      serviceId: 'general-consult',
      serviceName: 'General Consultation',
      serviceDuration: 30,
      servicePrice: 650,
      paymentType: 'private',
      date: todayStr,
      timeSlot: '10:00',
      status: 'in_consultation',
      reasonForVisit: 'Migraine with aura since yesterday morning.',
      isFirstVisit: true,
      doctorNotes: 'In consultation room 1. Evaluating neurological symptoms and Sumatriptan suitability.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-today-04',
      reference: 'PRT-8204',
      patientName: 'Annemarie Botha',
      patientEmail: 'annemarie.botha@law.co.za',
      patientPhone: '083 712 9044',
      idNumber: '7610090098084',
      gender: 'female',
      serviceId: 'health-checkup',
      serviceName: 'Comprehensive Health & Executive Screening',
      serviceDuration: 45,
      servicePrice: 950,
      paymentType: 'medical_aid',
      medicalAidScheme: 'Discovery Health',
      medicalAidNumber: '883920194',
      date: todayStr,
      timeSlot: '10:45',
      status: 'checked_in',
      reasonForVisit: 'Annual vitality / executive wellness screening and routine blood profile.',
      isFirstVisit: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-today-05',
      reference: 'PRT-8205',
      patientName: 'Zandile Khumalo',
      patientEmail: 'zandile.khumalo@standardbank.co.za',
      patientPhone: '081 556 7890',
      idNumber: '8907230198087',
      gender: 'female',
      serviceId: 'chronic-review',
      serviceName: 'Chronic Disease Review',
      serviceDuration: 30,
      servicePrice: 700,
      paymentType: 'medical_aid',
      medicalAidScheme: 'GEMS (Government Employees)',
      medicalAidNumber: '556102938',
      date: todayStr,
      timeSlot: '11:30',
      status: 'confirmed',
      reasonForVisit: 'Type 2 diabetes follow-up, HbA1c review, and Metformin repeat script.',
      isFirstVisit: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-today-06',
      reference: 'PRT-8206',
      patientName: 'David Coetzee',
      patientEmail: 'd.coetzee@engsol.co.za',
      patientPhone: '082 667 1234',
      idNumber: '8004185012083',
      gender: 'male',
      serviceId: 'general-consult',
      serviceName: 'General Consultation',
      serviceDuration: 30,
      servicePrice: 650,
      paymentType: 'private',
      date: todayStr,
      timeSlot: '12:15',
      status: 'confirmed',
      reasonForVisit: 'Sudden lumbar back spasm after lifting heavy equipment.',
      isFirstVisit: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-today-07',
      reference: 'PRT-8207',
      patientName: 'Nokuthula Dlamini',
      patientEmail: 'noku.dlamini@telkom.co.za',
      patientPhone: '072 889 0123',
      idNumber: '9612040182088',
      gender: 'female',
      serviceId: 'telehealth-followup',
      serviceName: 'Telehealth / Video Consultation',
      serviceDuration: 20,
      servicePrice: 500,
      paymentType: 'medical_aid',
      medicalAidScheme: 'Medihelp',
      medicalAidNumber: '334918201',
      date: todayStr,
      timeSlot: '14:00',
      status: 'confirmed',
      reasonForVisit: 'Review of full blood count and iron deficiency panel lab results.',
      isFirstVisit: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-today-08',
      reference: 'PRT-8208',
      patientName: 'Francois Du Plessis',
      patientEmail: 'francois.dp@pretoriabiz.co.za',
      patientPhone: '084 332 1199',
      idNumber: '8508305089085',
      gender: 'male',
      serviceId: 'general-consult',
      serviceName: 'General Consultation',
      serviceDuration: 30,
      servicePrice: 650,
      paymentType: 'medical_aid',
      medicalAidScheme: 'Bestmed Medical Scheme',
      medicalAidNumber: '661829301',
      date: todayStr,
      timeSlot: '14:45',
      status: 'pending',
      reasonForVisit: 'Persistent acid reflux and stomach cramps after eating.',
      isFirstVisit: true,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-tom-01',
      reference: 'PRT-8301',
      patientName: 'Marietjie Venter',
      patientEmail: 'm.venter@menlynmed.co.za',
      patientPhone: '083 456 7891',
      idNumber: '7309110082081',
      gender: 'female',
      serviceId: 'chronic-review',
      serviceName: 'Chronic Disease Review',
      serviceDuration: 30,
      servicePrice: 700,
      paymentType: 'medical_aid',
      medicalAidScheme: 'Discovery Health',
      medicalAidNumber: '992019482',
      date: tomorrowStr,
      timeSlot: '08:30',
      status: 'confirmed',
      reasonForVisit: 'Thyroid hormone adjustment and blood test review.',
      isFirstVisit: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// In-memory cache for local dev
let inMemoryStore: StorageData | null = null;

function loadLocalStore(): StorageData {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(content);
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn('Could not read clinic data file, using default data:', err);
  }

  const initialData: StorageData = {
    settings: DEFAULT_CLINIC_SETTINGS,
    appointments: generateSeedAppointments(),
  };

  saveLocalStore(initialData);
  return initialData;
}

function saveLocalStore(data: StorageData) {
  inMemoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist clinic data to disk:', err);
  }
}

// Generate unique booking reference code like PRT-7281
export function generateReference(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PRT-${num}`;
}

export async function getAllAppointments(filters?: {
  date?: string;
  status?: string;
  search?: string;
}): Promise<Appointment[]> {
  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();

      // Ensure seed appointments exist in DB if table is fresh
      try {
        const countRes = await queryPostgres('SELECT COUNT(*) as cnt FROM appointments');
        const count = Number(countRes[0]?.cnt || countRes[0]?.count || 0);
        if (count === 0) {
          const seeds = generateSeedAppointments();
          for (const s of seeds) {
            await queryPostgres(
              `INSERT INTO appointments (
                id, reference, patient_name, patient_email, patient_phone, id_number, dob, gender,
                service_id, service_name, service_duration, service_price, payment_type,
                medical_aid_scheme, medical_aid_number, medical_aid_dependent_code,
                date, time_slot, status, reason_for_visit, is_first_visit, doctor_notes, cancellation_reason,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
              ON CONFLICT (id) DO NOTHING`,
              [
                s.id,
                s.reference,
                s.patientName,
                s.patientEmail,
                s.patientPhone,
                s.idNumber,
                s.dob || null,
                s.gender || null,
                s.serviceId,
                s.serviceName,
                s.serviceDuration,
                s.servicePrice,
                s.paymentType,
                s.medicalAidScheme || null,
                s.medicalAidNumber || null,
                s.medicalAidDependentCode || null,
                s.date,
                s.timeSlot,
                s.status,
                s.reasonForVisit,
                s.isFirstVisit,
                s.doctorNotes || null,
                s.cancellationReason || null,
                s.createdAt,
                s.updatedAt,
              ]
            );
          }
        }
      } catch (seedErr) {
        console.warn('Seeding check skipped:', seedErr);
      }

      let query = 'SELECT * FROM appointments WHERE 1=1';
      const params: any[] = [];

      if (filters?.date) {
        params.push(filters.date);
        query += ` AND date = $${params.length}`;
      }

      if (filters?.status && filters.status !== 'all') {
        params.push(filters.status);
        query += ` AND status = $${params.length}`;
      }

      if (filters?.search) {
        params.push(`%${filters.search.toLowerCase()}%`);
        const idx = params.length;
        query += ` AND (LOWER(patient_name) LIKE $${idx} OR LOWER(reference) LIKE $${idx} OR patient_phone LIKE $${idx} OR id_number LIKE $${idx})`;
      }

      query += ' ORDER BY date DESC, time_slot ASC';
      const rows = await queryPostgres(query, params);
      return rows.map(mapRowToAppointment);
    } catch (err) {
      console.warn('Postgres getAllAppointments error, using fallback:', err);
    }
  }

  // Fallback to local store
  const store = loadLocalStore();
  let result = [...store.appointments];

  if (filters?.date) {
    result = result.filter((a) => a.date === filters.date);
  }

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((a) => a.status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.reference.toLowerCase().includes(q) ||
        a.patientPhone.includes(q) ||
        a.patientEmail.toLowerCase().includes(q) ||
        (a.idNumber && a.idNumber.includes(q))
    );
  }

  return result.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    return a.timeSlot.localeCompare(b.timeSlot);
  });
}

export async function getAppointmentById(id: string): Promise<Appointment | undefined> {
  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();
      const rows = await queryPostgres('SELECT * FROM appointments WHERE id = $1 LIMIT 1', [id]);
      if (rows.length > 0) return mapRowToAppointment(rows[0]);
    } catch (err) {
      console.warn('Postgres getAppointmentById error, using fallback:', err);
    }
  }

  const store = loadLocalStore();
  return store.appointments.find((a) => a.id === id);
}

export async function getAppointmentByReference(reference: string): Promise<Appointment | undefined> {
  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();
      const rows = await queryPostgres(
        'SELECT * FROM appointments WHERE UPPER(reference) = UPPER($1) LIMIT 1',
        [reference.trim()]
      );
      if (rows.length > 0) return mapRowToAppointment(rows[0]);
    } catch (err) {
      console.warn('Postgres getAppointmentByReference error, using fallback:', err);
    }
  }

  const store = loadLocalStore();
  return store.appointments.find(
    (a) => a.reference.toUpperCase() === reference.trim().toUpperCase()
  );
}

export async function getAvailableSlots(dateStr: string): Promise<{
  isOpen: boolean;
  message?: string;
  totalSlots: number;
  availableCount: number;
  maxDailyCapacity: number;
  bookedSlots: string[];
  slots: {
    time: string;
    isAvailable: boolean;
    period: 'morning' | 'afternoon';
  }[];
}> {
  const settings = await getClinicSettings();
  const safeSettings = {
    ...DEFAULT_CLINIC_SETTINGS,
    ...settings,
    operatingHours: settings?.operatingHours || DEFAULT_CLINIC_SETTINGS.operatingHours,
  };

  if (safeSettings.blockedDates?.includes(dateStr)) {
    return {
      isOpen: false,
      message: 'The clinic is closed on this date (Doctor leave or public holiday).',
      totalSlots: 0,
      availableCount: 0,
      maxDailyCapacity: safeSettings.maxDailyCapacity,
      bookedSlots: [],
      slots: [],
    };
  }

  const dateObj = new Date(dateStr + 'T12:00:00');
  const dayIndex = dateObj.getDay();
  const daysMap: Array<keyof typeof safeSettings.operatingHours> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const dayKey = daysMap[dayIndex] || 'monday';
  const schedule = safeSettings.operatingHours?.[dayKey] || DEFAULT_CLINIC_SETTINGS.operatingHours[dayKey];

  if (!schedule || !schedule.isOpen) {
    return {
      isOpen: false,
      message: 'The clinic is closed on ' + dayKey.charAt(0).toUpperCase() + dayKey.slice(1) + 's.',
      totalSlots: 0,
      availableCount: 0,
      maxDailyCapacity: safeSettings.maxDailyCapacity,
      bookedSlots: [],
      slots: [],
    };
  }

  // Fetch active bookings for this date
  let appointmentsForDate: Appointment[] = [];
  try {
    appointmentsForDate = await getAllAppointments({ date: dateStr });
  } catch (e) {
    console.warn('Could not load appointments for date:', e);
  }

  const activeBookings = appointmentsForDate.filter((a) => a.status !== 'cancelled');
  const bookedTimeSlots = activeBookings.map((a) => a.timeSlot);

  // Daily capacity cap (7 to 11 limit, default 10)
  const isCapReached = activeBookings.length >= safeSettings.maxDailyCapacity;

  const morning = schedule.morningSlots || ['08:30', '09:15', '10:00', '10:45', '11:30', '12:15'];
  const afternoon = schedule.afternoonSlots || ['14:00', '14:45', '15:30', '16:15'];

  const allConfiguredSlots = [
    ...morning.map((time) => ({ time, period: 'morning' as const })),
    ...afternoon.map((time) => ({ time, period: 'afternoon' as const })),
  ];

  const slots = allConfiguredSlots.map(({ time, period }) => {
    const isBooked = bookedTimeSlots.includes(time);
    const isAvailable = !isBooked && !isCapReached;
    return {
      time,
      isAvailable,
      period,
    };
  });

  const availableCount = isCapReached ? 0 : slots.filter((s) => s.isAvailable).length;

  return {
    isOpen: true,
    totalSlots: allConfiguredSlots.length,
    availableCount,
    maxDailyCapacity: safeSettings.maxDailyCapacity,
    bookedSlots: bookedTimeSlots,
    slots,
  };
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'reference' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const availability = await getAvailableSlots(data.date);
  if (!availability.isOpen) {
    return { success: false, error: availability.message || 'Clinic is closed on selected date.' };
  }

  if (availability.bookedSlots.includes(data.timeSlot)) {
    return { success: false, error: `Time slot ${data.timeSlot} on ${data.date} is already booked.` };
  }

  if (availability.availableCount <= 0) {
    return {
      success: false,
      error: `Doctor has reached maximum capacity (${availability.maxDailyCapacity} patients) for ${data.date}. Please pick another date.`,
    };
  }

  const now = new Date().toISOString();
  const newAppointment: Appointment = {
    ...data,
    id: 'apt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    reference: generateReference(),
    status: data.status || 'confirmed',
    createdAt: now,
    updatedAt: now,
  };

  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();
      await queryPostgres(
        `INSERT INTO appointments (
          id, reference, patient_name, patient_email, patient_phone, id_number, dob, gender,
          service_id, service_name, service_duration, service_price, payment_type,
          medical_aid_scheme, medical_aid_number, medical_aid_dependent_code,
          date, time_slot, status, reason_for_visit, is_first_visit, doctor_notes, cancellation_reason,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
        [
          newAppointment.id,
          newAppointment.reference,
          newAppointment.patientName,
          newAppointment.patientEmail,
          newAppointment.patientPhone,
          newAppointment.idNumber,
          newAppointment.dob || null,
          newAppointment.gender || null,
          newAppointment.serviceId,
          newAppointment.serviceName,
          newAppointment.serviceDuration,
          newAppointment.servicePrice,
          newAppointment.paymentType,
          newAppointment.medicalAidScheme || null,
          newAppointment.medicalAidNumber || null,
          newAppointment.medicalAidDependentCode || null,
          newAppointment.date,
          newAppointment.timeSlot,
          newAppointment.status,
          newAppointment.reasonForVisit,
          newAppointment.isFirstVisit,
          newAppointment.doctorNotes || null,
          newAppointment.cancellationReason || null,
          newAppointment.createdAt,
          newAppointment.updatedAt,
        ]
      );

      return { success: true, appointment: newAppointment };
    } catch (err: any) {
      console.warn('Postgres insert error, falling back to local store:', err);
    }
  }

  // Fallback to local store
  const store = loadLocalStore();
  store.appointments.push(newAppointment);
  saveLocalStore(store);

  return { success: true, appointment: newAppointment };
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  let existing = await getAppointmentById(id);
  if (!existing) {
    existing = await getAppointmentByReference(id);
  }

  if (!existing) {
    return { success: false, error: 'Appointment not found' };
  }

  // Conflict check if changing date or time
  if (
    (updates.date && updates.date !== existing.date) ||
    (updates.timeSlot && updates.timeSlot !== existing.timeSlot)
  ) {
    const targetDate = updates.date || existing.date;
    const targetSlot = updates.timeSlot || existing.timeSlot;

    const existingAppts = await getAllAppointments({ date: targetDate });
    const conflict = existingAppts.find(
      (a) => a.id !== existing!.id && a.timeSlot === targetSlot && a.status !== 'cancelled'
    );

    if (conflict) {
      return { success: false, error: `Slot ${targetSlot} on ${targetDate} is already booked by another patient.` };
    }
  }

  const updated: Appointment = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();
      await queryPostgres(
        `UPDATE appointments SET
          date = $1,
          time_slot = $2,
          status = $3,
          doctor_notes = $4,
          cancellation_reason = $5,
          updated_at = $6
        WHERE id = $7`,
        [
          updated.date,
          updated.timeSlot,
          updated.status,
          updated.doctorNotes || null,
          updated.cancellationReason || null,
          updated.updatedAt,
          existing.id,
        ]
      );

      return { success: true, appointment: updated };
    } catch (err: any) {
      console.warn('Postgres update error, falling back to local store:', err);
    }
  }

  // Fallback to local store
  const store = loadLocalStore();
  const index = store.appointments.findIndex((a) => a.id === existing!.id);
  if (index !== -1) {
    store.appointments[index] = updated;
    saveLocalStore(store);
  }

  return { success: true, appointment: updated };
}

export async function cancelAppointment(
  idOrRef: string,
  reason?: string
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  return updateAppointment(idOrRef, {
    status: 'cancelled',
    cancellationReason: reason || 'Cancelled by patient',
  });
}

export async function deleteAppointment(id: string): Promise<boolean> {
  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();
      await queryPostgres('DELETE FROM appointments WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.warn('Postgres delete error, falling back to local store:', err);
    }
  }

  const store = loadLocalStore();
  const index = store.appointments.findIndex((a) => a.id === id);
  if (index === -1) return false;

  store.appointments.splice(index, 1);
  saveLocalStore(store);
  return true;
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();
      const rows = await queryPostgres('SELECT data FROM clinic_settings WHERE id = 1 LIMIT 1');
      if (rows.length > 0 && rows[0].data) {
        let raw = rows[0].data;
        if (typeof raw === 'string') {
          try {
            raw = JSON.parse(raw);
          } catch (e) {
            raw = null;
          }
        }
        if (raw && typeof raw === 'object') {
          return {
            ...DEFAULT_CLINIC_SETTINGS,
            ...raw,
            operatingHours: raw.operatingHours || DEFAULT_CLINIC_SETTINGS.operatingHours,
          };
        }
      }
    } catch (err) {
      console.warn('Could not read settings from Postgres, falling back:', err);
    }
  }

  const store = loadLocalStore();
  return store.settings || DEFAULT_CLINIC_SETTINGS;
}

export async function updateClinicSettings(updates: Partial<ClinicSettings>): Promise<ClinicSettings> {
  const current = await getClinicSettings();
  const updated: ClinicSettings = {
    ...current,
    ...updates,
    operatingHours: updates.operatingHours || current.operatingHours || DEFAULT_CLINIC_SETTINGS.operatingHours,
  };

  if (isPostgresConfigured()) {
    try {
      await initPostgresSchema();
      await queryPostgres(
        'UPDATE clinic_settings SET data = $1, updated_at = NOW() WHERE id = 1',
        [JSON.stringify(updated)]
      );
      return updated;
    } catch (err) {
      console.warn('Postgres update settings error, using local fallback:', err);
    }
  }

  const store = loadLocalStore();
  store.settings = updated;
  saveLocalStore(store);
  return updated;
}

export async function getDashboardStats(targetDate?: string): Promise<DashboardStats> {
  const dateStr = targetDate || formatDate(new Date());
  const settings = await getClinicSettings();
  const all = await getAllAppointments();

  const todayAppointments = all.filter(
    (a) => a.date === dateStr && a.status !== 'cancelled'
  );
  const pending = all.filter((a) => a.status === 'pending');
  const completedToday = todayAppointments.filter((a) => a.status === 'completed');

  const today = new Date(dateStr + 'T00:00:00');
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 7);
  const weekLaterStr = formatDate(weekLater);

  const upcomingThisWeek = all.filter(
    (a) => a.date >= dateStr && a.date <= weekLaterStr && a.status !== 'cancelled'
  );

  const cancelledCount = all.filter((a) => a.status === 'cancelled').length;
  const patientPhones = new Set(all.map((a) => a.patientPhone));

  const maxDaily = settings.maxDailyCapacity || 10;
  const capacityPct = Math.min(100, Math.round((todayAppointments.length / maxDaily) * 100));

  return {
    todayAppointmentsCount: todayAppointments.length,
    maxDailyCapacity: maxDaily,
    todayCapacityPercent: capacityPct,
    pendingConfirmationCount: pending.length,
    completedTodayCount: completedToday.length,
    upcomingThisWeekCount: upcomingThisWeek.length,
    cancelledCount,
    totalPatientsCount: patientPhones.size,
  };
}
