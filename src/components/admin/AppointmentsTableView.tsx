'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Clock,
  Printer,
  ChevronDown,
  Stethoscope,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/lib/types';

interface AppointmentsTableViewProps {
  appointments: Appointment[];
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onOpenNotes: (appointment: Appointment) => void;
  onOpenReschedule: (appointment: Appointment) => void;
  selectedDate: string;
}

export default function AppointmentsTableView({
  appointments,
  onStatusChange,
  onOpenNotes,
  onOpenReschedule,
  selectedDate,
}: AppointmentsTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'selected' | 'today'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter appointments
  const filtered = appointments.filter((a) => {
    // Date filter
    if (dateFilterMode === 'selected' && a.date !== selectedDate) return false;
    if (dateFilterMode === 'today' && a.date !== todayStr) return false;

    // Status filter
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        a.patientName.toLowerCase().includes(q) ||
        a.reference.toLowerCase().includes(q) ||
        a.patientPhone.includes(q) ||
        a.patientEmail.toLowerCase().includes(q) ||
        (a.idNumber && a.idNumber.includes(q)) ||
        a.serviceName.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'in_consultation':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">In Room</span>;
      case 'checked_in':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Arrived</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Pending</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Cancelled</span>;
      case 'confirmed':
      default:
        return <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Confirmed</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search patient, phone, SA ID, or PRT reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setDateFilterMode('selected')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                dateFilterMode === 'selected' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selected Date ({selectedDate})
            </button>
            <button
              onClick={() => setDateFilterMode('today')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                dateFilterMode === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today Only
            </button>
            <button
              onClick={() => setDateFilterMode('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                dateFilterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({appointments.length})
            </button>
          </div>

          <button
            onClick={handlePrint}
            title="Print Schedule"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="px-5 pt-3 border-b border-slate-100 flex gap-4 text-xs font-semibold overflow-x-auto">
        {[
          { key: 'all', label: 'All Statuses' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'checked_in', label: 'Arrived / Waiting' },
          { key: 'in_consultation', label: 'In Room' },
          { key: 'completed', label: 'Completed' },
          { key: 'pending', label: 'Pending' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`pb-2.5 border-b-2 whitespace-nowrap transition-colors ${
              statusFilter === tab.key
                ? 'border-brand-600 text-brand-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Time & Date</th>
              <th className="px-5 py-3">Ref & Patient</th>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Billing</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Clinical Notes</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Time & Date */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {appt.timeSlot}
                    </span>
                    <span className="text-[11px] text-slate-500">{appt.date}</span>
                  </td>

                  {/* Patient Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{appt.patientName}</span>
                      {appt.isFirstVisit && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-brand-700 font-semibold">{appt.reference}</span>
                      <span>•</span>
                      <span>{appt.patientPhone}</span>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-5 py-4">
                    <span className="font-medium text-slate-800 block">{appt.serviceName}</span>
                    <span className="text-[11px] text-slate-400">{appt.serviceDuration} mins</span>
                  </td>

                  {/* Billing */}
                  <td className="px-5 py-4">
                    {appt.paymentType === 'medical_aid' ? (
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {appt.medicalAidScheme}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          #{appt.medicalAidNumber || 'EDI'}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-slate-800 block">Private (Cash/Card)</span>
                        <span className="text-[11px] text-slate-500">R{appt.servicePrice}</span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(appt.status)}</td>

                  {/* Clinical Notes */}
                  <td className="px-5 py-4 max-w-xs">
                    {appt.doctorNotes ? (
                      <p className="text-[11px] text-slate-600 font-mono line-clamp-2">
                        {appt.doctorNotes}
                      </p>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No notes yet</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenNotes(appt)}
                        title="Add/Edit Clinical Notes"
                        className="text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 p-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenReschedule(appt)}
                        title="Reschedule appointment"
                        className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-xs transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>

                      {/* Status quick select */}
                      <select
                        value={appt.status}
                        onChange={(e) => onStatusChange(appt.id, e.target.value as any)}
                        className="text-[11px] font-semibold border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Arrived</option>
                        <option value="in_consultation">In Room</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-slate-600">No appointments found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Try clearing your search or picking a different date filter.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
