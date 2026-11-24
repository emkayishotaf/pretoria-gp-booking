import { NextRequest, NextResponse } from 'next/server';
import { getClinicSettings, updateClinicSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getClinicSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching clinic settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateClinicSettings(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating clinic settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
