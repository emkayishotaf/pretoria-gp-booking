'use client';

import React from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface CapacityMetricsProps {
  stats: DashboardStats | null;
  selectedDate: string;
}

export default function CapacityMetrics({ stats, selectedDate }: CapacityMetricsProps) {
  if (!stats) return null;

  const capacityPct = stats.todayCapacityPercent;
  const isFull = stats.todayAppointmentsCount >= stats.maxDailyCapacity;
  const isNearLimit = stats.todayAppointmentsCount >= stats.maxDailyCapacity - 2;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Daily Capacity Card */}
      <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm border border-slate-700/60 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-400">
              Daily Patient Capacity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white">
                {stats.todayAppointmentsCount}
              </span>
              <span className="text-slate-400 text-sm font-semibold">
                / {stats.maxDailyCapacity} Patients Max
              </span>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isFull
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : isNearLimit
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {isFull ? 'At Capacity' : isNearLimit ? 'Nearly Full' : 'Optimal Pace'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-rose-500'
                  : isNearLimit
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-brand-400 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, capacityPct)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
            <span>{stats.maxDailyCapacity - stats.todayAppointmentsCount} open slot(s) remaining</span>
            <span>{capacityPct}% booked</span>
          </div>
        </div>
      </div>

      {/* 2. Pending Confirmations */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
            Pending Actions
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.pendingConfirmationCount}</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">New web bookings awaiting check-in</p>
      </div>

      {/* 3. Completed Today */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Seen Today
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.completedTodayCount}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Consultations concluded with notes</p>
      </div>

      {/* 4. Upcoming Next 7 Days */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block">
            This Week&apos;s Schedule
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.upcomingThisWeekCount}</span>
            <Calendar className="w-4 h-4 text-brand-600" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Booked across next 7 clinic days</p>
      </div>
    </div>
  );
}
