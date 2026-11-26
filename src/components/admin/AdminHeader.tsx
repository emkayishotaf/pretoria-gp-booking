'use client';

import React from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  PlusCircle,
  ExternalLink,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Lock,
} from 'lucide-react';
import { ClinicSettings } from '@/lib/types';

interface AdminHeaderProps {
  settings: ClinicSettings | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenNewBooking: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  activeTab: 'timeline' | 'table' | 'settings';
  setActiveTab: (tab: 'timeline' | 'table' | 'settings') => void;
  onSignOut?: () => void;
}

export default function AdminHeader({
  settings,
  selectedDate,
  onDateChange,
  onOpenNewBooking,
  onRefresh,
  refreshing,
  activeTab,
  setActiveTab,
  onSignOut,
}: AdminHeaderProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white">
                {settings?.doctorName || 'Dr. Kgomotso Mokoena'}
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Doctor / Admin Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Brooklyn Bridge Office Park, Pretoria • Practice No: {settings?.practiceNumber || 'PR 0148293'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={() => onDateChange(todayStr)}
                className="text-[10px] font-bold text-brand-300 hover:text-white bg-slate-700 px-1.5 py-0.5 rounded"
              >
                Today
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Schedule"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* New Patient Booking */}
          <button
            onClick={onOpenNewBooking}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Walk-in / Phone Patient</span>
          </button>

          {/* View Public Portal */}
          <Link
            href="/"
            target="_blank"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Client Portal</span>
          </Link>

          {/* Lock / Sign Out */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Lock Doctor Portal"
              className="text-xs text-rose-300 hover:text-white flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-3 py-2 rounded-xl font-medium transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 text-xs sm:text-sm border-t border-slate-800/80">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today&apos;s Daily Agenda & Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`py-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'table'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Appointments & Records</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Capacity & Practice Hours</span>
        </button>
      </div>
    </header>
  );
}
