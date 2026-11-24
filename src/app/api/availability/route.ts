import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date query parameter is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const data = await getAvailableSlots(date);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
