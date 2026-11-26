'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, Calendar, Phone, MapPin, ShieldCheck, UserCog } from 'lucide-react';

interface NavbarProps {
  onOpenLookup: () => void;
  onBookClick?: () => void;
}

export default function Navbar({ onOpenLookup, onBookClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro bar for Pretoria practice contact */}
      <div className="bg-brand-900 text-brand-100 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-300" />
              <span>Brooklyn Bridge Office Park, Fehrsen St, Pretoria</span>
            </span>
            <span className="hidden md:inline-block text-brand-400">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-300" />
              <span>+27 (0)12 460 8820</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 bg-brand-800/80 px-2 py-0.5 rounded text-[11px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Practicing Today (08:30 - 16:30)
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-brand-200 hover:text-white transition-colors text-[11px] font-medium"
            >
              <UserCog className="w-3 h-3" />
              <span>Doctor / Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5 text-brand-50" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                Dr. Kgomotso Mokoena
              </span>
              <span className="hidden lg:inline-block bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                GP • Pretoria
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Brooklyn Family Care & Medical Practice
            </p>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenLookup}
            type="button"
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1 border border-slate-200 sm:border-transparent hover:border-brand-200"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Find My Booking</span>
            <span className="sm:hidden">Lookup</span>
          </button>

          <Link
            href="/admin"
            className="text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Admin</span>
          </Link>

          <button
            onClick={onBookClick}
            type="button"
            className="bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1 active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-100" />
            <span>Book Visit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
