import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const technicianId = searchParams.get('technicianId');

    let jobs = db.getJobCards();

    if (status) {
      jobs = jobs.filter((j) => j.status === status);
    }
    if (customerId) {
      jobs = jobs.filter((j) => j.customerId === customerId);
    }
    if (technicianId) {
      jobs = jobs.filter((j) => j.assignedTechnicianId === technicianId);
    }

    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
