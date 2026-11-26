import { NextRequest, NextResponse } from 'next/server';
import { createAppointment, getAllAppointments } from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Practice admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const appointments = await getAllAppointments({ date, status, search });
    return NextResponse.json({ appointments, count: appointments.length });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Required fields check
    const required = [
      'patientName',
      'patientEmail',
      'patientPhone',
      'idNumber',
      'serviceId',
      'serviceName',
      'serviceDuration',
      'servicePrice',
      'paymentType',
      'date',
      'timeSlot',
      'reasonForVisit',
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = await createAppointment({
      patientName: body.patientName.trim(),
      patientEmail: body.patientEmail.trim(),
      patientPhone: body.patientPhone.trim(),
      idNumber: body.idNumber.trim(),
      dob: body.dob,
      gender: body.gender || 'other',
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      serviceDuration: Number(body.serviceDuration) || 30,
      servicePrice: Number(body.servicePrice) || 650,
      paymentType: body.paymentType,
      medicalAidScheme: body.medicalAidScheme,
      medicalAidNumber: body.medicalAidNumber,
      medicalAidDependentCode: body.medicalAidDependentCode,
      date: body.date,
      timeSlot: body.timeSlot,
      status: body.status || 'confirmed',
      reasonForVisit: body.reasonForVisit.trim(),
      isFirstVisit: Boolean(body.isFirstVisit),
      doctorNotes: body.doctorNotes || '',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
