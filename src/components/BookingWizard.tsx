'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building2,
  ArrowRight,
  ArrowLeft,
  CalendarPlus,
  Download,
  Share2,
  MapPin,
  Phone,
  Info,
  Shield,
  Check,
} from 'lucide-react';
import { Appointment, MedicalService, PaymentType } from '@/lib/types';
import { MEDICAL_SERVICES, SA_MEDICAL_AIDS } from '@/lib/constants';
import { downloadICSFile, generateGoogleCalendarUrl } from '@/lib/calendar';

interface BookingWizardProps {
  onBookingComplete?: (appointment: Appointment) => void;
  initialService?: MedicalService | null;
}

export default function BookingWizard({
  onBookingComplete,
  initialService,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [selectedService, setSelectedService] = useState<MedicalService>(
    initialService || MEDICAL_SERVICES[0]
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Patient Details
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [paymentType, setPaymentType] = useState<PaymentType>('medical_aid');
  const [medicalAidScheme, setMedicalAidScheme] = useState('Discovery Health');
  const [medicalAidNumber, setMedicalAidNumber] = useState('');
  const [medicalAidDependentCode, setMedicalAidDependentCode] = useState('00');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Availability query state
  const [availability, setAvailability] = useState<{
    isOpen: boolean;
    message?: string;
    totalSlots: number;
    availableCount: number;
    maxDailyCapacity: number;
    slots: { time: string; isAvailable: boolean; period: 'morning' | 'afternoon' }[];
  } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmed appointment
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Next 10 days for date picker
  const [availableDays, setAvailableDays] = useState<
    { dateStr: string; label: string; dayName: string; isToday: boolean }[]
  >([]);

  // Smooth scroll to top of wizard on step transitions
  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setCurrentStep(step);
    setTimeout(() => {
      const el = document.getElementById('booking-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  // If initialService is provided or changed from outside
  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
      goToStep(2);
    }
  }, [initialService]);

  useEffect(() => {
    const days: { dateStr: string; label: string; dayName: string; isToday: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      if (d.getDay() === 0) continue; // Skip Sunday

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      days.push({
        dateStr,
        label: `${day} ${monthNames[d.getMonth()]}`,
        dayName: dayNames[d.getDay()],
        isToday: i === 0,
      });

      if (days.length >= 10) break;
    }

    setAvailableDays(days);
    if (days.length > 0) {
      setSelectedDate(days[0].dateStr);
    }
  }, []);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      setErrorMessage(null);
      setSelectedSlot('');
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}`);
        if (!res.ok) {
          throw new Error('Failed to load slots');
        }
        const data = await res.json();
        if (data && typeof data.isOpen === 'boolean') {
          setAvailability(data);
        } else {
          throw new Error(data?.error || 'Invalid availability response');
        }
      } catch (err: any) {
        console.warn('Using standard operating hours fallback:', err.message);
        setAvailability({
          isOpen: true,
          totalSlots: 10,
          availableCount: 10,
          maxDailyCapacity: 10,
          slots: [
            { time: '08:30', isAvailable: true, period: 'morning' },
            { time: '09:15', isAvailable: true, period: 'morning' },
            { time: '10:00', isAvailable: true, period: 'morning' },
            { time: '10:45', isAvailable: true, period: 'morning' },
            { time: '11:30', isAvailable: true, period: 'morning' },
            { time: '12:15', isAvailable: true, period: 'morning' },
            { time: '14:00', isAvailable: true, period: 'afternoon' },
            { time: '14:45', isAvailable: true, period: 'afternoon' },
            { time: '15:30', isAvailable: true, period: 'afternoon' },
            { time: '16:15', isAvailable: true, period: 'afternoon' },
          ],
        });
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedDate]);

  // Form Submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedDate || !selectedSlot) {
      setErrorMessage('Please select an appointment date and time slot.');
      goToStep(2);
      return;
    }

    if (!patientName.trim() || !patientPhone.trim() || !patientEmail.trim() || !idNumber.trim()) {
      setErrorMessage('Please fill in all required patient details.');
      return;
    }

    if (paymentType === 'medical_aid' && !medicalAidNumber.trim()) {
      setErrorMessage('Please enter your Medical Aid membership number.');
      return;
    }

    setSubmitting(true);

    try {
      // Reason automatically inherits the selected clinical service!
      const finalReason = additionalNotes.trim()
        ? `${selectedService.name} - ${additionalNotes.trim()}`
        : selectedService.name;

      const payload = {
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
        idNumber: idNumber.trim(),
        dob,
        gender,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        serviceDuration: selectedService.durationMinutes,
        servicePrice: selectedService.priceZAR,
        paymentType,
        medicalAidScheme: paymentType === 'medical_aid' ? medicalAidScheme : undefined,
        medicalAidNumber: paymentType === 'medical_aid' ? medicalAidNumber.trim() : undefined,
        medicalAidDependentCode:
          paymentType === 'medical_aid' ? medicalAidDependentCode.trim() : undefined,
        date: selectedDate,
        timeSlot: selectedSlot,
        status: 'confirmed',
        reasonForVisit: finalReason,
        isFirstVisit,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      setConfirmedAppointment(data);
      goToStep(4);
      if (onBookingComplete) {
        onBookingComplete(data);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Something went wrong. Please check availability and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    goToStep(1);
    setSelectedSlot('');
    setConfirmedAppointment(null);
    setErrorMessage(null);
    setAdditionalNotes('');
  };

  return (
    <div
      ref={containerRef}
      id="booking-section"
      className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden scroll-mt-28"
    >
      {/* Step Header */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-xs uppercase tracking-widest text-brand-400 font-semibold mb-1">
              Brooklyn Medical Practice • Pretoria
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Book Doctor Consultation</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Professional, dedicated family healthcare with Dr. Kgomotso Mokoena.
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {[
              { num: 1, label: 'Service' },
              { num: 2, label: 'Date & Time' },
              { num: 3, label: 'Patient Info' },
              { num: 4, label: 'Confirmed' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    currentStep === s.num
                      ? 'bg-brand-500 text-slate-950 font-black ring-4 ring-brand-500/30'
                      : currentStep > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? '✓' : s.num}
                </div>
                <span
                  className={`hidden md:inline ${
                    currentStep === s.num
                      ? 'text-white font-semibold'
                      : currentStep > s.num
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
                {s.num < 4 && <div className="hidden sm:block w-3 h-0.5 bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 m-4 text-sm text-rose-800 flex items-start gap-3 rounded-r-lg">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to proceed</p>
            <p className="text-rose-700 text-xs sm:text-sm mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {currentStep === 1 && (
        <div className="p-5 sm:p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">1. Select Consultation Type</h3>
            <p className="text-sm text-slate-500">
              Click on a consultation type below to immediately choose your date & time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MEDICAL_SERVICES.map((srv) => {
              const isSelected = selectedService.id === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedService(srv);
                    goToStep(2);
                  }}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/40 shadow-md ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/80 shadow-xs'
                  }`}
                >
                  {srv.badge && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider uppercase bg-brand-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                      {srv.badge}
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-2 pr-12">
                    <h4 className="font-bold text-slate-900 text-base">{srv.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{srv.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {srv.durationMinutes} Minutes
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-sm">R{srv.priceZAR}</span>
                      <span className="text-[11px] text-slate-500 block">or Medical Aid rate</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <span className="text-xs font-bold text-brand-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Select & Choose Time</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Full medical aid claiming available (Discovery, Bonitas, GEMS, etc.)</span>
            </div>
            <button
              onClick={() => goToStep(2)}
              className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow flex items-center gap-2 active:scale-95 transition-all"
            >
              <span>Continue with {selectedService.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE & TIME SLOT */}
      {currentStep === 2 && (
        <div className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">2. Select Consultation Date & Time</h3>
              <p className="text-sm text-slate-500">
                Select your preferred date and time for your consultation.
              </p>
            </div>
            <button
              onClick={() => goToStep(1)}
              className="text-xs font-bold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 flex items-center gap-1 self-start sm:self-center transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Service ({selectedService.name})</span>
            </button>
          </div>

          {/* Date Selector Row */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Available Clinic Days
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {availableDays.map((d) => {
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`flex-shrink-0 w-24 p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-medium text-slate-500 uppercase">{d.dayName}</span>
                    <span className="block text-sm font-bold mt-0.5">{d.label}</span>
                    {d.isToday && (
                      <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capacity Notice */}
          {availability && (
            <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    availability.availableCount > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {availability.isOpen ? (
                      availability.availableCount > 0 ? (
                        <>
                          <span className="text-emerald-700 font-bold">{availability.availableCount} consultation slots</span>{' '}
                          open for {selectedDate}
                        </>
                      ) : (
                        <span className="text-rose-700 font-bold">
                          Fully Booked for this date (Daily limit of {availability.maxDailyCapacity} patients reached)
                        </span>
                      )
                    ) : (
                      <span className="text-amber-700 font-medium">{availability.message || 'Clinic Closed'}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Punctual consultations with minimal waiting room delays.
                  </p>
                </div>
              </div>

              <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-600">
                Operating: 08:30 - 16:30
              </div>
            </div>
          )}

          {/* Time Slots Grid */}
          {loadingSlots ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Checking Dr. Mokoena&apos;s real-time schedule...</p>
            </div>
          ) : availability && availability.isOpen ? (
            <div className="space-y-6">
              {/* Morning Slots */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Morning Consultations (08:30 – 12:30)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availability.slots
                    .filter((s) => s.period === 'morning')
                    .map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                            isSelected
                              ? 'border-brand-600 bg-brand-700 text-white shadow-md ring-2 ring-brand-400'
                              : slot.isAvailable
                              ? 'border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50 text-slate-800'
                              : 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                          }`}
                        >
                          <span>{slot.time}</span>
                          <span className="block text-[10px] font-normal mt-0.5">
                            {isSelected ? 'Selected' : slot.isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Afternoon Slots */}
              {availability.slots.some((s) => s.period === 'afternoon') && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>Afternoon Consultations (14:00 – 16:30)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {availability.slots
                      .filter((s) => s.period === 'afternoon')
                      .map((slot) => {
                        const isSelected = selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                              isSelected
                                ? 'border-brand-600 bg-brand-700 text-white shadow-md ring-2 ring-brand-400'
                                : slot.isAvailable
                                ? 'border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50 text-slate-800'
                                : 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                            }`}
                          >
                            <span>{slot.time}</span>
                            <span className="block text-[10px] font-normal mt-0.5">
                              {isSelected ? 'Selected' : slot.isAvailable ? 'Available' : 'Booked'}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
              <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold">Clinic is closed on this date</p>
              <p className="text-xs text-slate-500 mt-1">
                Please pick another weekday or Saturday morning.
              </p>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => goToStep(1)}
              className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              disabled={!selectedSlot}
              onClick={() => goToStep(3)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm shadow flex items-center gap-2 transition-all ${
                selectedSlot
                  ? 'bg-brand-700 hover:bg-brand-800 text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Patient Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PATIENT INTAKE & BILLING FORM */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmitBooking} className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">3. Patient Information & Medical Aid</h3>
              <p className="text-sm text-slate-500">
                Your medical details are confidential and securely handled in compliance with POPIA.
              </p>
            </div>
            {/* Booking Summary Pill */}
            <div className="bg-brand-50 border border-brand-200 text-brand-900 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
              <CalendarIcon className="w-3.5 h-3.5 text-brand-700" />
              <span>
                {selectedDate} @ {selectedSlot} • {selectedService.name}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Patient Personal Details */}
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-4">
                <User className="w-4 h-4 text-brand-700" />
                <span>Patient Identification</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name & Surname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Ndlovu"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-sm text-slate-900 font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SA ID Number or Passport *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8811205128082"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full text-sm text-slate-900 font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white placeholder:text-slate-400"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Required for HPCSA medical records and medical aid claims
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 082 441 9923"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full text-sm text-slate-900 font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white placeholder:text-slate-400"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    SMS and WhatsApp appointment reminders are sent here
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sipho@gmail.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full text-sm text-slate-900 font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white placeholder:text-slate-400"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Calendar invite and confirmation reference sent here
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full text-sm text-slate-900 font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Status
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="visitType"
                        checked={!isFirstVisit}
                        onChange={() => setIsFirstVisit(false)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>Returning Patient</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="visitType"
                        checked={isFirstVisit}
                        onChange={() => setIsFirstVisit(true)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>New Patient (1st Visit)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Medical Aid Information */}
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
                <CreditCard className="w-4 h-4 text-brand-700" />
                <span>Payment & Medical Scheme Billing</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div
                  onClick={() => setPaymentType('medical_aid')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between ${
                    paymentType === 'medical_aid'
                      ? 'border-brand-600 bg-brand-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-brand-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">South African Medical Aid</p>
                      <p className="text-[11px] text-slate-500">Discovery, Bonitas, Momentum, GEMS, etc.</p>
                    </div>
                  </div>
                  {paymentType === 'medical_aid' && <CheckCircle2 className="w-4 h-4 text-brand-700" />}
                </div>

                <div
                  onClick={() => setPaymentType('private')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between ${
                    paymentType === 'private'
                      ? 'border-brand-600 bg-brand-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-brand-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Private / Self-Pay</p>
                      <p className="text-[11px] text-slate-500">Pay at practice via Card, Cash, or SnapScan</p>
                    </div>
                  </div>
                  {paymentType === 'private' && <CheckCircle2 className="w-4 h-4 text-brand-700" />}
                </div>
              </div>

              {/* Medical Aid specific inputs */}
              {paymentType === 'medical_aid' ? (
                <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Medical Scheme *
                    </label>
                    <select
                      value={medicalAidScheme}
                      onChange={(e) => setMedicalAidScheme(e.target.value)}
                      className="w-full text-xs sm:text-sm text-slate-900 font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {SA_MEDICAL_AIDS.map((sch) => (
                        <option key={sch} value={sch}>
                          {sch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Membership Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 928401928"
                      value={medicalAidNumber}
                      onChange={(e) => setMedicalAidNumber(e.target.value)}
                      className="w-full text-xs sm:text-sm text-slate-900 font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dependent Code
                    </label>
                    <input
                      type="text"
                      placeholder="00 (Main), 01, 02..."
                      value={medicalAidDependentCode}
                      onChange={(e) => setMedicalAidDependentCode(e.target.value)}
                      className="w-full text-xs sm:text-sm text-slate-900 font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                  <span>
                    Estimated consultation fee: <strong className="text-slate-900 font-bold">R{selectedService.priceZAR}</strong>.
                    Payment is made at reception upon arrival. No online upfront payment required.
                  </span>
                </div>
              )}
            </div>

            {/* Optional Doctor Notes (Replaces redundant reason for visit) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Additional Notes or Symptoms (Optional)
                </label>
                <span className="text-[11px] text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Service: {selectedService.name}
                </span>
              </div>
              <textarea
                rows={2}
                placeholder="Optional: mention any specific symptoms, allergies, or repeat scripts you need..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full text-sm text-slate-900 font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white placeholder:text-slate-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Your consultation is automatically categorized under <strong>{selectedService.name}</strong>. You do not need to re-explain your visit.
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Time</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Securing Appointment...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: CONFIRMATION & CALENDAR INVITE */}
      {currentStep === 4 && confirmedAppointment && (
        <div className="p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
            Appointment Confirmed
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            You&apos;re Booked with Dr. Mokoena!
          </h3>

          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
            We have reserved your slot. A confirmation email and SMS reminder have been scheduled.
          </p>

          {/* Reference Card */}
          <div className="my-6 max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Booking Reference</span>
                <p className="text-xl font-mono font-bold text-brand-700 tracking-wider">
                  {confirmedAppointment.reference}
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Patient</span>
                <strong className="text-slate-800 font-semibold">{confirmedAppointment.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Service</span>
                <strong className="text-slate-800 font-semibold">{confirmedAppointment.serviceName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Date & Time</span>
                <strong className="text-slate-800 font-semibold">
                  {confirmedAppointment.date} @ {confirmedAppointment.timeSlot}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Billing</span>
                <strong className="text-slate-800 font-semibold">
                  {confirmedAppointment.paymentType === 'medical_aid'
                    ? `${confirmedAppointment.medicalAidScheme} (Claim)`
                    : `Private (R${confirmedAppointment.servicePrice})`}
                </strong>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                Suite 402, Brooklyn Bridge Office Park, 570 Fehrsen St, Brooklyn, Pretoria.
                Free secure basement parking available.
              </span>
            </div>
          </div>

          {/* Calendar export buttons */}
          <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a
              href={generateGoogleCalendarUrl(confirmedAppointment)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <CalendarPlus className="w-4 h-4 text-brand-600" />
              <span>Add to Google Calendar</span>
            </a>

            <button
              onClick={() => downloadICSFile(confirmedAppointment)}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download iCal / Outlook</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
            <button
              onClick={resetBooking}
              className="text-brand-700 hover:text-brand-800 font-bold underline"
            >
              Book Another Appointment
            </button>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <a
              href="https://maps.google.com/?q=Brooklyn+Bridge+Office+Park+Pretoria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Get Directions to Clinic</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
