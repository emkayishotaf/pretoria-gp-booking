import { Appointment } from './types';

// Format YYYYMMDDTHHmmssZ for ICS
function formatICSDate(dateStr: string, timeSlot: string, durationMinutes: number = 30): { start: string; end: string } {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);

  // Note: South Africa is UTC+2 (SAST, no DST)
  const startDate = new Date(Date.UTC(year, month - 1, day, hours - 2, minutes, 0));
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const toICS = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return {
    start: toICS(startDate),
    end: toICS(endDate),
  };
}

export function generateGoogleCalendarUrl(appointment: Appointment): string {
  const { start, end } = formatICSDate(appointment.date, appointment.timeSlot, appointment.serviceDuration);

  const title = encodeURIComponent(`Dr. Kgomotso Mokoena - ${appointment.serviceName}`);
  const details = encodeURIComponent(
    `Medical Consultation with Dr. Kgomotso Mokoena (General Practitioner).\nRef: ${appointment.reference}\nPatient: ${appointment.patientName}\nLocation: Suite 402, Brooklyn Bridge Office Park, 570 Fehrsen St, Brooklyn, Pretoria\nPhone: +27 12 460 8820`
  );
  const location = encodeURIComponent('Brooklyn Bridge Office Park, 570 Fehrsen St, Brooklyn, Pretoria');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export function generateICSContent(appointment: Appointment): string {
  const { start, end } = formatICSDate(appointment.date, appointment.timeSlot, appointment.serviceDuration);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dr Kgomotso Mokoena Pretoria GP//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@brooklyngp.co.za`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Dr. Kgomotso Mokoena - ${appointment.serviceName}`,
    `DESCRIPTION:Medical Consultation at Brooklyn Family Care.\\nBooking Ref: ${appointment.reference}\\nPatient: ${appointment.patientName}\\nService: ${appointment.serviceName}\\nContact: +27 12 460 8820`,
    'LOCATION:Suite 402\\, Brooklyn Bridge Office Park\\, 570 Fehrsen St\\, Brooklyn\\, Pretoria',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICSFile(appointment: Appointment) {
  const ics = generateICSContent(appointment);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Dr-Mokoena-Appointment-${appointment.reference}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
