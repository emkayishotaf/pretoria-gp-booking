import { NextRequest, NextResponse } from 'next/server';
import { getClinicSettings, updateClinicSettings } from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getClinicSettings();
    // Do not leak admin password in public GET responses
    const { adminPassword, ...safeSettings } = settings as any;
    return NextResponse.json(safeSettings);
  } catch (error: any) {
    console.error('Error fetching clinic settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Practice admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updated = await updateClinicSettings(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating clinic settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
