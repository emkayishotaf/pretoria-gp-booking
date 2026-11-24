'use client';

import React from 'react';
import { Award, Clock, HeartHandshake, ShieldCheck, Check, Sparkles, MapPin } from 'lucide-react';

export default function DoctorBioSection() {
  return (
    <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Doctor Profile Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-3xl blur-lg opacity-25"></div>
              <div className="relative bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-inner">
                    KM
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white">Dr. Kgomotso Mokoena</h3>
                    <p className="text-xs text-brand-300 font-medium">
                      MBChB (UP), Dip Obst (SA), FCFP (SA)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Family Physician & General Practitioner
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">HPCSA Reg:</span>
                    <span className="font-mono text-brand-200">MP 0689421</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">BHF Practice No:</span>
                    <span className="font-mono text-brand-200">PR 0148293</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Clinical Focus:</span>
                    <span className="text-slate-200">Preventative, Chronic & Family Care</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-200">Brooklyn, Pretoria</span>
                  </div>
                </div>

                {/* Key feature callout */}
                <div className="mt-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
                    <Clock className="w-4 h-4" />
                    <span>The 7–11 Patient Promise</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    &ldquo;I intentionally limit consultations to 7–11 patients per day. You receive 30–45 minutes of thorough examination, active listening, and personalized treatment without feeling rushed.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Values & Practice highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                Primary Healthcare Excellence in Pretoria
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Healthcare that values your time and listens to your concerns.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
                Located conveniently at Brooklyn Bridge Office Park with secure covered parking, Dr. Mokoena provides patient-centered family medical care for infants, children, adults, and seniors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                {
                  icon: Clock,
                  title: 'Minimal Waiting Time',
                  desc: 'Punctual slot management means you are seen on time, not left sitting in a crowded waiting room.',
                },
                {
                  icon: ShieldCheck,
                  title: 'All Medical Aids Claimed',
                  desc: 'Direct electronic EDI claims to Discovery, Bonitas, Momentum, GEMS, and all registered SA medical schemes.',
                },
                {
                  icon: HeartHandshake,
                  title: 'Comprehensive Diagnosis',
                  desc: 'Evidence-based clinical guidelines, preventative screenings, and continuity of care for chronic conditions.',
                },
                {
                  icon: Award,
                  title: 'Convenient Pretoria Location',
                  desc: 'Minutes away from Brooklyn Mall, Waterkloof, Hatfield, and Pretoria East with full wheelchair accessibility.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <item.icon className="w-5 h-5 text-brand-700 mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <a
                href="#booking-section"
                className="bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow transition-all flex items-center gap-2"
              >
                <span>Reserve Today&apos;s or Tomorrow&apos;s Slot</span>
              </a>
              <span className="text-xs text-slate-500">
                Or call reception directly at <strong className="text-slate-800">+27 12 460 8820</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
