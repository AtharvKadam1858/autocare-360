import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { labourId, technicianId, hours, actor } = body;

    if (!labourId) {
      return NextResponse.json({ success: false, error: 'Labour ID is required' }, { status: 400 });
    }

    const job = db.addLabourToJob(
      params.id,
      labourId,
      technicianId || 'user-technician',
      hours ? Number(hours) : undefined,
      actor
    );

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
