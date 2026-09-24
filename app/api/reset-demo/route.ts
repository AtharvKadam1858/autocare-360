import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    db.resetToSeed();
    return NextResponse.json({ success: true, message: 'Database reset to initial seed state successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
