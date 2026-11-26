export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentType = 'medical_aid' | 'private';

export interface MedicalService {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceZAR: number;
  description: string;
  badge?: string;
}

export interface Appointment {
  id: string;
  reference: string; // e.g. PRT-8241
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  idNumber: string; // South African ID or Passport
  dob?: string;
  gender?: 'female' | 'male' | 'other';
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  paymentType: PaymentType;
  medicalAidScheme?: string;
  medicalAidNumber?: string;
  medicalAidDependentCode?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:15"
  status: AppointmentStatus;
  reasonForVisit: string;
  isFirstVisit: boolean;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

export interface DaySchedule {
  isOpen: boolean;
  morningSlots: string[];
  afternoonSlots: string[];
}

export interface ClinicSettings {
  doctorName: string;
  title: string;
  qualification: string;
  hpcsaNumber: string;
  practiceNumber: string;
  clinicName: string;
  address: string;
  suburb: string;
  city: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  maxDailyCapacity: number; // e.g. 10
  defaultSlotDuration: number; // 30 mins
  adminPassword?: string; // Optional custom practice password
  operatingHours: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  blockedDates: string[]; // YYYY-MM-DD
}

export interface DashboardStats {
  todayAppointmentsCount: number;
  maxDailyCapacity: number;
  todayCapacityPercent: number;
  pendingConfirmationCount: number;
  completedTodayCount: number;
  upcomingThisWeekCount: number;
  cancelledCount: number;
  totalPatientsCount: number;
}
