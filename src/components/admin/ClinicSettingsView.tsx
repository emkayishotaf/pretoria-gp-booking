'use client';

import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Shield, AlertCircle, Clock, MapPin, Lock } from 'lucide-react';
import { ClinicSettings } from '@/lib/types';

interface ClinicSettingsViewProps {
  settings: ClinicSettings | null;
  onUpdateSettings: (updated: Partial<ClinicSettings>) => Promise<void>;
}

export default function ClinicSettingsView({
  settings,
  onUpdateSettings,
}: ClinicSettingsViewProps) {
  const [maxDailyCapacity, setMaxDailyCapacity] = useState<number>(
    settings?.maxDailyCapacity || 10
  );
  const [phone, setPhone] = useState(settings?.phone || '+27 12 460 8820');
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp || '+27 82 555 1928');
  const [email, setEmail] = useState(settings?.email || 'reception@brooklyngp.co.za');
  const [address, setAddress] = useState(
    settings?.address || 'Suite 402, Brooklyn Bridge Office Park, 570 Fehrsen St'
  );
  const [hpcsaNumber, setHpcsaNumber] = useState(settings?.hpcsaNumber || 'MP 0689421');
  const [practiceNumber, setPracticeNumber] = useState(settings?.practiceNumber || 'PR 0148293');
  const [blockedDateInput, setBlockedDateInput] = useState('');
  const [blockedDates, setBlockedDates] = useState<string[]>(settings?.blockedDates || []);
  const [adminPassword, setAdminPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload: Partial<ClinicSettings> = {
        maxDailyCapacity: Number(maxDailyCapacity),
        phone,
        whatsapp,
        email,
        address,
        hpcsaNumber,
        practiceNumber,
        blockedDates,
      };

      if (adminPassword.trim()) {
        payload.adminPassword = adminPassword.trim();
      }

      await onUpdateSettings(payload);
      setAdminPassword('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = () => {
    if (!blockedDateInput || blockedDates.includes(blockedDateInput)) return;
    setBlockedDates([...blockedDates, blockedDateInput]);
    setBlockedDateInput('');
  };

  const handleRemoveBlockedDate = (d: string) => {
    setBlockedDates(blockedDates.filter((item) => item !== d));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-600" />
          <span>Practice & Daily Patient Capacity Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure daily patient volume limits, consultation duration, practice registration numbers, and closed dates.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Practice settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        {/* Daily Capacity Slider */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-brand-700 block">
                Daily Consultation Limit (Volume Control)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Set the maximum patient consultation limit per day.
              </p>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-2xl text-slate-900">{maxDailyCapacity}</span>
              <span className="text-xs text-slate-400 block font-medium">Patients / Day</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="5"
              max="15"
              step="1"
              value={maxDailyCapacity}
              onChange={(e) => setMaxDailyCapacity(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>5 patients</span>
              <span className="text-brand-700 font-bold">Recommended standard for GP practice</span>
              <span>15 patients</span>
            </div>
          </div>
        </div>

        {/* Practice Registration Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              HPCSA Medical Registration Number
            </label>
            <input
              type="text"
              value={hpcsaNumber}
              onChange={(e) => setHpcsaNumber(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              BHF Practice Number (Medical Aid Claims)
            </label>
            <input
              type="text"
              value={practiceNumber}
              onChange={(e) => setPracticeNumber(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reception Landline
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Practice WhatsApp Line
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reception Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Physical Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Physical Practice Address in Pretoria
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
          />
        </div>

        {/* Blocked Dates / Doctor Leave */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Block Out Dates (Doctor on Leave / Clinic Closed)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={blockedDateInput}
              onChange={(e) => setBlockedDateInput(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            />
            <button
              type="button"
              onClick={handleAddBlockedDate}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add Blocked Date
            </button>
          </div>

          {blockedDates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blockedDates.map((d) => (
                <span
                  key={d}
                  className="bg-white border border-rose-200 text-rose-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono"
                >
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedDate(d)}
                    className="text-rose-500 hover:text-rose-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No closed leave dates currently set.</p>
          )}
        </div>

        {/* Security & Access Password */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Practice Portal Security & Admin Password</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Set a custom access password for the doctor and receptionist admin portal. Leave blank to keep current password.
          </p>
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Admin Password
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter new password (e.g. PretoriaGP2025!)"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Standard default password: <code className="text-slate-600 font-mono">DrMokoena2025!</code>
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Practice Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
