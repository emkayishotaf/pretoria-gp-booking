'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Stethoscope, Save } from 'lucide-react';
import { Appointment } from '@/lib/types';

interface ClinicalNotesModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSaveNotes: (id: string, notes: string, markCompleted: boolean) => Promise<void>;
}

export default function ClinicalNotesModal({
  isOpen,
  appointment,
  onClose,
  onSaveNotes,
}: ClinicalNotesModalProps) {
  const [notes, setNotes] = useState(appointment?.doctorNotes || '');
  const [markCompleted, setMarkCompleted] = useState(true);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (appointment) {
      setNotes(appointment.doctorNotes || '');
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveNotes(appointment.id, notes, markCompleted);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Clinical Consultation Notes</h3>
              <p className="text-xs text-slate-400">
                Dr. Kgomotso Mokoena • {appointment.patientName} ({appointment.timeSlot})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Patient Quick Glance */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Chief Complaint:</span>
              <p className="text-slate-800 font-medium italic">&ldquo;{appointment.reasonForVisit}&rdquo;</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing:</span>
              <p className="text-slate-800 font-medium">
                {appointment.paymentType === 'medical_aid'
                  ? `${appointment.medicalAidScheme} (Claim EDI)`
                  : `Private Practice (R${appointment.servicePrice})`}
              </p>
            </div>
          </div>

          {/* Notes Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Doctor&apos;s Diagnosis, Prescriptions & Plan
            </label>
            <textarea
              rows={5}
              placeholder="e.g. Vitals: BP 120/80, Pulse 72. Chest clear. Diagnosis: Acute viral upper respiratory infection. Rx: Paracetamol 1g TDS, saline nasal spray, rest 3 days. Medical certificate issued..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          {/* Mark completed checkbox */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-blue-900 cursor-pointer">
              <input
                type="checkbox"
                checked={markCompleted}
                onChange={(e) => setMarkCompleted(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Conclude Consultation & Mark as Completed</span>
            </label>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
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
              disabled={saving}
              className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Clinical Notes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
