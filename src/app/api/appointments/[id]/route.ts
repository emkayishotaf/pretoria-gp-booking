import { NextRequest, NextResponse } from 'next/server';
import {
  getAppointmentById,
  getAppointmentByReference,
  updateAppointment,
  deleteAppointment,
} from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let appt = await getAppointmentById(id);
    if (!appt) {
      appt = await getAppointmentByReference(id);
    }

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appt);
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    let existing = await getAppointmentById(id);
    if (!existing) {
      existing = await getAppointmentByReference(id);
    }

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const result = await updateAppointment(existing.id, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.appointment);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let existing = await getAppointmentById(id);
    if (!existing) {
      existing = await getAppointmentByReference(id);
    }

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const success = await deleteAppointment(existing.id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
