'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Stethoscope } from 'lucide-react';

export default function ClinicInfoFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Practice Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span>Dr. Kgomotso Mokoena</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Family Practice & Primary Healthcare Clinic in Brooklyn, Pretoria. Dedicated to patient-first care with guaranteed consultation times.
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              <p>HPCSA: MP 0689421</p>
              <p>Practice No: PR 0148293</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Practice Contact</h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>Suite 402, Brooklyn Bridge Office Park, 570 Fehrsen St, Brooklyn, Pretoria, 0181</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400 shrink-0" />
              <span>+27 (0)12 460 8820</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-400 shrink-0" />
              <span>reception@brooklyngp.co.za</span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Consulting Hours</h4>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span>Monday – Friday:</span>
              <span className="text-slate-200 font-medium">08:30 – 16:30</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span>Saturday:</span>
              <span className="text-slate-200 font-medium">09:00 – 12:00</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>Sunday & Holidays:</span>
              <span className="text-rose-400">Closed (On-Call)</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              * Emergency after-hours care: Life Groenkloof Hospital or Netcare Jakaranda.
            </p>
          </div>

          {/* Quick Links & Admin */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Quick Navigation</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <a href="#booking-section" className="hover:text-brand-300 transition-colors">
                  Book Consultation Online
                </a>
              </li>
              <li>
                <a href="#services-overview" className="hover:text-brand-300 transition-colors">
                  Services & Medical Aid Tariffs
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Doctor & Staff Admin Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Dr. Kgomotso Mokoena Inc. All rights reserved. POPIA compliant.</p>
          <p className="text-slate-500 flex items-center gap-1">
            <span>Built with care for general practice in Pretoria</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
