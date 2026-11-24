'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import CapacityMetrics from '@/components/admin/CapacityMetrics';
import DailyTimelineView from '@/components/admin/DailyTimelineView';
import AppointmentsTableView from '@/components/admin/AppointmentsTableView';
import ClinicSettingsView from '@/components/admin/ClinicSettingsView';
import WalkInBookingModal from '@/components/admin/WalkInBookingModal';
import ClinicalNotesModal from '@/components/admin/ClinicalNotesModal';
import RescheduleModal from '@/components/admin/RescheduleModal';
import { Appointment, AppointmentStatus, ClinicSettings, DashboardStats } from '@/lib/types';

export default function AdminDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'timeline' | 'table' | 'settings'>('timeline');

  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInSlot, setWalkInSlot] = useState<string | undefined>(undefined);

  const [notesAppointment, setNotesAppointment] = useState<Appointment | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [apptsRes, statsRes, settingsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch(`/api/stats?date=${selectedDate}`),
        fetch('/api/settings'),
      ]);

      const [apptsData, statsData, settingsData] = await Promise.all([
        apptsRes.json(),
        statsRes.json(),
        settingsRes.json(),
      ]);

      if (apptsData.appointments) {
        setAppointments(apptsData.appointments);
      }
      setStats(statsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Status Change Handler
  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update appointment status');
        return;
      }

      const updated = await res.json();

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a))
      );

      // Re-fetch stats
      const statsRes = await fetch(`/api/stats?date=${selectedDate}`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Clinical Notes Handler
  const handleSaveNotes = async (id: string, notes: string, markCompleted: boolean) => {
    try {
      const payload: Partial<Appointment> = { doctorNotes: notes };
      if (markCompleted) {
        payload.status = 'completed';
      }

      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save notes');
      const updated = await res.json();

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );

      // Re-fetch stats
      const statsRes = await fetch(`/api/stats?date=${selectedDate}`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error(err);
      alert('Could not save notes. Please try again.');
    }
  };

  // Reschedule Handler
  const handleReschedule = async (id: string, newDate: string, newSlot: string) => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate, timeSlot: newSlot, status: 'confirmed' }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reschedule appointment');

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, date: newDate, timeSlot: newSlot } : a))
    );

    // Refresh data
    fetchData();
  };

  // Walk-in booking success
  const handleBookingSuccess = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev]);
    fetchData();
  };

  // Settings update
  const handleUpdateSettings = async (updates: Partial<ClinicSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error('Failed to update settings');
    const updated = await res.json();
    setSettings(updated);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Admin Header with Navigation and Quick Actions */}
      <AdminHeader
        settings={settings}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenNewBooking={() => {
          setWalkInSlot(undefined);
          setIsWalkInOpen(true);
        }}
        onRefresh={fetchData}
        refreshing={refreshing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* KPI Metrics Strip */}
        <CapacityMetrics stats={stats} selectedDate={selectedDate} />

        {/* Tab 1: Daily Timeline View */}
        {activeTab === 'timeline' && (
          <DailyTimelineView
            selectedDate={selectedDate}
            appointments={appointments}
            settings={settings}
            onStatusChange={handleStatusChange}
            onOpenNotes={(appt) => {
              setNotesAppointment(appt);
              setIsNotesOpen(true);
            }}
            onOpenReschedule={(appt) => {
              setRescheduleAppointment(appt);
              setIsRescheduleOpen(true);
            }}
            onOpenNewBookingWithSlot={(timeSlot) => {
              setWalkInSlot(timeSlot);
              setIsWalkInOpen(true);
            }}
          />
        )}

        {/* Tab 2: Master Appointments Table */}
        {activeTab === 'table' && (
          <AppointmentsTableView
            appointments={appointments}
            onStatusChange={handleStatusChange}
            onOpenNotes={(appt) => {
              setNotesAppointment(appt);
              setIsNotesOpen(true);
            }}
            onOpenReschedule={(appt) => {
              setRescheduleAppointment(appt);
              setIsRescheduleOpen(true);
            }}
            selectedDate={selectedDate}
          />
        )}

        {/* Tab 3: Practice Settings */}
        {activeTab === 'settings' && (
          <ClinicSettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Walk-in Booking Modal */}
      <WalkInBookingModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        defaultDate={selectedDate}
        defaultSlot={walkInSlot}
        onSuccess={handleBookingSuccess}
      />

      {/* Clinical Notes Modal */}
      <ClinicalNotesModal
        isOpen={isNotesOpen}
        appointment={notesAppointment}
        onClose={() => {
          setIsNotesOpen(false);
          setNotesAppointment(null);
        }}
        onSaveNotes={handleSaveNotes}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        appointment={rescheduleAppointment}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleAppointment(null);
        }}
        onReschedule={handleReschedule}
      />
    </div>
  );
}
