'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Appointment } from '@/lib/types';

interface RescheduleModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onReschedule: (id: string, newDate: string, newSlot: string) => Promise<void>;
}

export default function RescheduleModal({
  isOpen,
  appointment,
  onClose,
  onReschedule,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointment) {
      setNewDate(appointment.date);
      setNewSlot(appointment.timeSlot);
    }
  }, [appointment]);

  useEffect(() => {
    if (!newDate) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      setError(null);
      try {
        const res = await fetch(`/api/availability?date=${newDate}`);
        const data = await res.json();
        if (data.isOpen) {
          const openTimes = data.slots
            .filter((s: any) => s.isAvailable || (appointment && s.time === appointment.timeSlot && newDate === appointment.date))
            .map((s: any) => s.time);
          setAvailableSlots(openTimes);
        } else {
          setAvailableSlots([]);
          setError(data.message || 'Clinic closed on this date.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [newDate, appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newSlot) return;

    setSaving(true);
    setError(null);
    try {
      await onReschedule(appointment.id, newDate, newSlot);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule appointment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Reschedule Appointment</h3>
            <p className="text-xs text-slate-400">
              {appointment.patientName} ({appointment.reference})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            Current Booking: <strong className="text-slate-800">{appointment.date} @ {appointment.timeSlot}</strong> ({appointment.serviceName})
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select New Date
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Available Time Slot
            </label>
            {loadingSlots ? (
              <p className="text-xs text-slate-400 py-2">Loading slots...</p>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setNewSlot(slot)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      newSlot === slot
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-200 hover:border-brand-400 text-slate-800'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-rose-600 py-1">No open slots on selected date.</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newSlot}
              className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
            >
              {saving ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
