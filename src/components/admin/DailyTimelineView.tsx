'use client';

import React from 'react';
import {
  Clock,
  User,
  Phone,
  FileText,
  CreditCard,
  Building2,
  CheckCircle,
  AlertCircle,
  Plus,
  Play,
  Check,
  Calendar,
  MoreVertical,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { Appointment, AppointmentStatus, ClinicSettings } from '@/lib/types';

interface DailyTimelineViewProps {
  selectedDate: string;
  appointments: Appointment[];
  settings: ClinicSettings | null;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onOpenNotes: (appointment: Appointment) => void;
  onOpenReschedule: (appointment: Appointment) => void;
  onOpenNewBookingWithSlot: (timeSlot: string) => void;
}

export default function DailyTimelineView({
  selectedDate,
  appointments,
  settings,
  onStatusChange,
  onOpenNotes,
  onOpenReschedule,
  onOpenNewBookingWithSlot,
}: DailyTimelineViewProps) {
  // Determine slots from settings or defaults
  const dateObj = new Date(selectedDate + 'T12:00:00');
  const dayNames: Array<keyof ClinicSettings['operatingHours']> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const dayKey = dayNames[dateObj.getDay()];
  const schedule = settings?.operatingHours?.[dayKey] || {
    isOpen: true,
    morningSlots: ['08:30', '09:15', '10:00', '10:45', '11:30', '12:15'],
    afternoonSlots: ['14:00', '14:45', '15:30', '16:15'],
  };

  if (!schedule.isOpen) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Practice Closed on this Date</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Dr. Mokoena is not consulting on {dayKey}s. Select another date from the header.
        </p>
      </div>
    );
  }

  const allSlots = [
    ...schedule.morningSlots.map((time) => ({ time, period: 'morning' as const })),
    ...schedule.afternoonSlots.map((time) => ({ time, period: 'afternoon' as const })),
  ];

  // Map appointments by timeSlot
  const appointmentBySlot = new Map<string, Appointment>();
  appointments.forEach((a) => {
    if (a.date === selectedDate && a.status !== 'cancelled') {
      appointmentBySlot.set(a.timeSlot, a);
    }
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            <span>Completed</span>
          </span>
        );
      case 'in_consultation':
        return (
          <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <Stethoscope className="w-3 h-3 text-purple-600" />
            <span>In Consultation Room</span>
          </span>
        );
      case 'checked_in':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <User className="w-3 h-3 text-emerald-600" />
            <span>In Waiting Room</span>
          </span>
        );
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Pending Confirmation
          </span>
        );
      case 'confirmed':
      default:
        return (
          <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Confirmed Slot
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header Info */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-slate-800">
            {selectedDate} Schedule ({appointmentBySlot.size} / {schedule.morningSlots.length + schedule.afternoonSlots.length} Slots Occupied)
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Arrived
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> In Room
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Concluded
          </span>
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-3">
        {allSlots.map(({ time, period }, index) => {
          const appt = appointmentBySlot.get(time);

          // Insert lunch break separator
          const isFirstAfternoon =
            period === 'afternoon' &&
            (index === 0 || allSlots[index - 1].period === 'morning');

          return (
            <React.Fragment key={time}>
              {isFirstAfternoon && (
                <div className="py-2 px-4 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>13:00 – 14:00 Lunch Break & Administrative Review</span>
                  </span>
                  <span>Practice Closed for Consultations</span>
                </div>
              )}

              <div
                className={`rounded-2xl border transition-all ${
                  appt
                    ? appt.status === 'in_consultation'
                      ? 'bg-purple-50/40 border-purple-300 shadow-md ring-1 ring-purple-300'
                      : appt.status === 'checked_in'
                      ? 'bg-emerald-50/30 border-emerald-300 shadow-sm'
                      : appt.status === 'completed'
                      ? 'bg-slate-50/80 border-slate-200 opacity-90'
                      : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    : 'bg-white border-dashed border-slate-300 hover:border-brand-400'
                }`}
              >
                {appt ? (
                  /* Slot with Patient */
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <span className="font-mono font-black text-slate-900 text-lg sm:text-xl block leading-tight">
                            {appt.timeSlot}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase">
                            {appt.serviceDuration}m slot
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">
                              {appt.patientName}
                            </h4>
                            <span className="font-mono text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-semibold">
                              {appt.reference}
                            </span>
                            {appt.isFirstVisit && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                New Patient
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>SA ID: {appt.idNumber || 'On file'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a href={`tel:${appt.patientPhone}`} className="hover:underline">
                                {appt.patientPhone}
                              </a>
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Status badge & Next step button */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {getStatusBadge(appt.status)}

                        {/* Fast Workflow Transitions */}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => onStatusChange(appt.id, 'checked_in')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                            title="Mark patient as arrived in waiting room"
                          >
                            Mark Arrived
                          </button>
                        )}

                        {appt.status === 'checked_in' && (
                          <button
                            onClick={() => onStatusChange(appt.id, 'in_consultation')}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                            title="Doctor starts examination"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start Consult</span>
                          </button>
                        )}

                        {appt.status === 'in_consultation' && (
                          <button
                            onClick={() => onOpenNotes(appt)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                            title="Add consultation diagnosis & conclude"
                          >
                            <Check className="w-3 h-3" />
                            <span>Finish & Notes</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Consultation Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Service:</span>
                        <strong className="text-slate-800 font-semibold">{appt.serviceName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Billing / Scheme:</span>
                        <strong className="text-slate-800 font-semibold">
                          {appt.paymentType === 'medical_aid'
                            ? `${appt.medicalAidScheme || 'Medical Aid'} (${appt.medicalAidNumber || 'EDI'})`
                            : `Private Practice (R${appt.servicePrice})`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Reason / Chief Complaint:</span>
                        <span className="text-slate-700 line-clamp-1 italic">
                          &ldquo;{appt.reasonForVisit}&rdquo;
                        </span>
                      </div>
                    </div>

                    {/* Doctor Clinical Notes Preview if available */}
                    {appt.doctorNotes && (
                      <div className="mt-3 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 text-[11px] block mb-0.5">
                          Doctor&apos;s Clinical Assessment & Notes:
                        </span>
                        <p className="text-slate-600 font-mono text-[11px]">{appt.doctorNotes}</p>
                      </div>
                    )}

                    {/* Bottom Action Strip */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenNotes(appt)}
                          className="text-brand-700 hover:text-brand-900 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{appt.doctorNotes ? 'Edit Clinical Notes' : '+ Add Clinical Notes'}</span>
                        </button>
                        <button
                          onClick={() => onOpenReschedule(appt)}
                          className="text-slate-500 hover:text-slate-800 font-medium hover:underline"
                        >
                          Reschedule
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            onClick={() => onStatusChange(appt.id, 'cancelled')}
                            className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold"
                          >
                            Cancel Slot
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Available Slot */
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center">
                        <span className="font-mono font-bold text-slate-400 text-lg block leading-tight">
                          {time}
                        </span>
                        <span className="text-[10px] text-slate-300 uppercase font-semibold">
                          30m slot
                        </span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                          Open Slot Available
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          No patient booked yet for this time
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenNewBookingWithSlot(time)}
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3.5 py-1.5 rounded-xl border border-brand-200 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Book Patient Here</span>
                    </button>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
