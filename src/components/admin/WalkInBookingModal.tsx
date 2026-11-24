'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, User, CreditCard, Building2, AlertCircle } from 'lucide-react';
import { Appointment, PaymentType } from '@/lib/types';
import { MEDICAL_SERVICES, SA_MEDICAL_AIDS } from '@/lib/constants';

interface WalkInBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  defaultSlot?: string;
  onSuccess: (newAppointment: Appointment) => void;
}

export default function WalkInBookingModal({
  isOpen,
  onClose,
  defaultDate,
  defaultSlot,
  onSuccess,
}: WalkInBookingModalProps) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [serviceId, setServiceId] = useState(MEDICAL_SERVICES[0].id);
  const [date, setDate] = useState(defaultDate);
  const [timeSlot, setTimeSlot] = useState(defaultSlot || '08:30');
  const [paymentType, setPaymentType] = useState<PaymentType>('medical_aid');
  const [medicalAidScheme, setMedicalAidScheme] = useState('Discovery Health');
  const [medicalAidNumber, setMedicalAidNumber] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [status, setStatus] = useState<'confirmed' | 'checked_in'>('checked_in');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDate(defaultDate);
    if (defaultSlot) setTimeSlot(defaultSlot);
  }, [defaultDate, defaultSlot]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName.trim() || !patientPhone.trim() || !idNumber.trim()) {
      setError('Please provide patient name, phone number, and ID.');
      return;
    }

    const selectedService = MEDICAL_SERVICES.find((s) => s.id === serviceId) || MEDICAL_SERVICES[0];

    setLoading(true);
    try {
      const payload = {
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || 'reception-walkin@brooklyngp.co.za',
        idNumber: idNumber.trim(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        serviceDuration: selectedService.durationMinutes,
        servicePrice: selectedService.priceZAR,
        paymentType,
        medicalAidScheme: paymentType === 'medical_aid' ? medicalAidScheme : undefined,
        medicalAidNumber: paymentType === 'medical_aid' ? medicalAidNumber.trim() : undefined,
        date,
        timeSlot,
        status,
        reasonForVisit: reasonForVisit.trim() || 'General consultation (Walk-in / Phone booking)',
        isFirstVisit,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save appointment');

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg">+ Quick Walk-in / Phone Booking</h3>
            <p className="text-xs text-slate-400">
              Directly schedule patient on Dr. Mokoena&apos;s live calendar
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
              >
                {['08:30', '09:15', '10:00', '10:45', '11:30', '12:15', '14:00', '14:45', '15:30', '16:15'].map(
                  (slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival Status</label>
            <div className="flex gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'checked_in'}
                  onChange={() => setStatus('checked_in')}
                />
                <span className="font-medium text-emerald-700">Patient Arrived (Waiting Room)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'confirmed'}
                  onChange={() => setStatus('confirmed')}
                />
                <span className="font-medium text-slate-700">Phone-in (Reserved)</span>
              </label>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Johan Nel"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 082 334 5566"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SA ID / Passport *</label>
              <input
                type="text"
                required
                placeholder="e.g. 9005125019082"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Service */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              {MEDICAL_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes}m - R{s.priceZAR})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Scheme */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="medical_aid">Medical Aid (Claim)</option>
                <option value="private">Private (Card / Cash)</option>
              </select>
            </div>

            {paymentType === 'medical_aid' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scheme</label>
                <select
                  value={medicalAidScheme}
                  onChange={(e) => setMedicalAidScheme(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {SA_MEDICAL_AIDS.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Symptoms
            </label>
            <input
              type="text"
              placeholder="e.g. Cough, acute fever, sick note..."
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          {/* Actions */}
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
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Save & Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
