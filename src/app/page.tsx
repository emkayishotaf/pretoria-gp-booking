'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import BookingWizard from '@/components/BookingWizard';
import ManageBookingModal from '@/components/ManageBookingModal';
import DoctorBioSection from '@/components/DoctorBioSection';
import ClinicInfoFooter from '@/components/ClinicInfoFooter';
import {
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  Sparkles,
  Phone,
  FileCheck,
  Stethoscope,
  Users,
  CheckCircle,
} from 'lucide-react';
import { MEDICAL_SERVICES, SA_MEDICAL_AIDS } from '@/lib/constants';

export default function HomePage() {
  const [lookupModalOpen, setLookupModalOpen] = useState(false);

  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Navbar
        onOpenLookup={() => setLookupModalOpen(true)}
        onBookClick={scrollToBooking}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white pt-10 pb-16 sm:pt-14 sm:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 bg-brand-900/90 border border-brand-700/60 text-brand-300 text-xs px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>General Practitioner • Brooklyn Bridge, Pretoria</span>
              <span className="text-brand-500">•</span>
              <span className="text-brand-200">7–11 Patients Daily Cap</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Personalized, unhurried healthcare in Pretoria.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Dr. Kgomotso Mokoena limits daily bookings to guarantee every patient receives focused clinical attention, comprehensive assessments, and zero rushed 10-minute turnaround.
            </p>

            {/* Quick trust metrics */}
            <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                <span>Discovery, Bonitas, GEMS & All Schemes</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>30 to 45 Min Consultations</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Brooklyn Bridge Office Park</span>
              </div>
            </div>
          </div>

          {/* Interactive Booking Wizard Embedded in Hero Container */}
          <div className="mt-10 max-w-4xl mx-auto">
            <BookingWizard />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-overview" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
              Clinical Services & Consultation Fees
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Comprehensive Primary & Family Medicine
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              All consultations are charged at medical aid rates or private practice tariff with upfront transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MEDICAL_SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                      {service.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {service.durationMinutes}m
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{service.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{service.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-lg">R{service.priceZAR}</span>
                    <span className="text-[11px] text-slate-500 block">Medical aid claimable</span>
                  </div>
                  <button
                    onClick={scrollToBooking}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Select & Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Bio and Philosophy */}
      <DoctorBioSection />

      {/* Medical Aid Partners Banner */}
      <section className="py-10 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            Direct EDI Claims to South African Medical Aid Schemes
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            {SA_MEDICAL_AIDS.map((aid) => (
              <span
                key={aid}
                className="bg-white border border-slate-200 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg shadow-2xs"
              >
                {aid}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <ClinicInfoFooter />

      {/* Client Lookup Modal */}
      <ManageBookingModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
      />
    </div>
  );
}
