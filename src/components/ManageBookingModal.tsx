'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  CalendarPlus,
  Download,
} from 'lucide-react';
import { Appointment } from '@/lib/types';
import { downloadICSFile, generateGoogleCalendarUrl } from '@/lib/calendar';

interface ManageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageBookingModal({ isOpen, onClose }: ManageBookingModalProps) {
  const [referenceQuery, setReferenceQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceQuery.trim()) return;

    setLoading(true);
    setError(null);
    setAppointment(null);
    setCancelSuccess(false);

    try {
      const res = await fetch(`/api/appointments/${encodeURIComponent(referenceQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Appointment not found. Please verify your reference code.');
      }

      setAppointment(data);
    } catch (err: any) {
      setError(err.message || 'Could not find appointment with that reference.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this appointment? This will release the slot to other patients.'
    );
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: 'Cancelled by patient via portal',
        }),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed to cancel appointment');

      setAppointment(updated);
      setCancelSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error cancelling appointment');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg">Find & Manage Your Booking</h3>
            <p className="text-xs text-slate-400">
              Dr. Kgomotso Mokoena • Brooklyn Family Care Pretoria
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter Reference (e.g. PRT-8201)"
                value={referenceQuery}
                onChange={(e) => setReferenceQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Lookup'}
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {error && (
            <div className="bg-rose-50 text-rose-800 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {cancelSuccess && (
            <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Appointment has been successfully cancelled. The slot has been released.</span>
            </div>
          )}

          {appointment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Reference
                  </span>
                  <span className="font-mono font-bold text-lg text-brand-700">
                    {appointment.reference}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      appointment.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'in_consultation'
                        ? 'bg-purple-100 text-purple-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {appointment.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Patient</span>
                  <p className="font-semibold text-slate-800">{appointment.patientName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Service</span>
                  <p className="font-semibold text-slate-800">{appointment.serviceName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Date & Time</span>
                  <p className="font-semibold text-slate-800">
                    {appointment.date} @ {appointment.timeSlot}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Billing</span>
                  <p className="font-semibold text-slate-800">
                    {appointment.paymentType === 'medical_aid'
                      ? `${appointment.medicalAidScheme}`
                      : `Private (R${appointment.servicePrice})`}
                  </p>
                </div>
              </div>

              {appointment.doctorNotes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Doctor&apos;s Consultation Notes</span>
                  <p className="text-slate-600">{appointment.doctorNotes}</p>
                </div>
              )}

              {/* Action buttons */}
              {appointment.status !== 'cancelled' && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <a
                      href={generateGoogleCalendarUrl(appointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-700 hover:text-brand-800 font-semibold bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Calendar</span>
                    </a>
                    <button
                      onClick={() => downloadICSFile(appointment)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-800 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>iCal</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            !error && (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Enter your 7-character booking code (e.g. PRT-8201) to view status or cancel.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
