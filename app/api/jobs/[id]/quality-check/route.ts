import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { passed, remarks, items, actor } = body;

    if (passed === undefined) {
      return NextResponse.json(
        { success: false, error: 'Pass/Fail boolean decision is required' },
        { status: 400 }
      );
    }

    const job = db.submitQualityCheck(
      params.id,
      Boolean(passed),
      remarks || (passed ? 'Quality check passed with excellence.' : 'Defects noted; reworked required.'),
      items || [],
      actor || { id: 'user-manager', name: 'Arvind Swamy', role: 'SERVICE_MANAGER' }
    );

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
